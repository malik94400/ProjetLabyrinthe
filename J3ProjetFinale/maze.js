class MazeBuilder {

    // Original JavaScript code by Chirp Internet: www.chirpinternet.eu
    // Please acknowledge use of this code by including this header.

    constructor(width, height) {

        this.width = width;
        this.height = height;

        this.cols = 2 * this.width + 1;
        this.rows = 2 * this.height + 1;

        // IMPORTANT: use a fresh array object for each cell (no shared refs)
        this.maze = this.initArray([]);

        this.hasKey = false; // état du joueur (a la clé ?)
        this.hero = null;

        /* place initial walls */

        this.maze.forEach((row, r) => {
            row.forEach((cell, c) => {
                switch(r)
                {
                    case 0:
                    case this.rows - 1:
                        this.maze[r][c] = ["wall"];
                        break;

                    default:
                        if((r % 2) == 1) {
                            if((c == 0) || (c == this.cols - 1)) {
                                this.maze[r][c] = ["wall"];
                            }
                        } else if(c % 2 == 0) {
                            this.maze[r][c] = ["wall"];
                        }

                }
            });

            if(r == 0) {
                /* place exit in top row */
                let doorPos = this.posToSpace(this.rand(1, this.width));
                this.maze[r][doorPos] = ["door", "exit"];
            }

            if(r == this.rows - 1) {
                /* place entrance in bottom row */
                let doorPos = this.posToSpace(this.rand(1, this.width));
                this.maze[r][doorPos] = ["door", "entrance"];
            }

        });

        /* start partitioning */

        this.partition(1, this.height - 1, 1, this.width - 1);

    }

    /* ---------- FIXED initArray ---------- */
    initArray(value) {
        // If value is undefined -> produce grid filled with undefined (used by pathfinding arrays)
        if (typeof value === "undefined") {
            return Array.from({length: this.rows}, () => new Array(this.cols).fill(undefined));
        }

        // If value is an array (like []) -> produce a unique array for each cell
        if (Array.isArray(value)) {
            return Array.from({length: this.rows}, () => Array.from({length: this.cols}, () => []));
        }

        // For primitive values: fill normally
        return Array.from({length: this.rows}, () => new Array(this.cols).fill(value));
    }

    rand(min, max) {
        return min + Math.floor(Math.random() * (1 + max - min));
    }

    posToSpace(x) {
        return 2 * (x-1) + 1;
    }

    posToWall(x) {
        return 2 * x;
    }

    inBounds(r, c) {
        if((typeof this.maze[r] == "undefined") || (typeof this.maze[r][c] == "undefined")) {
            return false; /* out of bounds */
        }
        return true;
    }

    shuffle(array) {
        /* sauce: https://stackoverflow.com/a/12646864 */
        for(let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    partition(r1, r2, c1, c2) {
        /* create partition walls
           ref: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method */

        let horiz, vert, x, y, start, end;

        if((r2 < r1) || (c2 < c1)) {
            return false;
        }

        if(r1 == r2) {
            horiz = r1;
        } else {
            x = r1+1;
            y = r2-1;
            start = Math.round(x + (y-x) / 4);
            end = Math.round(x + 3*(y-x) / 4);
            horiz = this.rand(start, end);
        }

        if(c1 == c2) {
            vert = c1;
        } else {
            x = c1 + 1;
            y = c2 - 1;
            start = Math.round(x + (y - x) / 3);
            end = Math.round(x + 2 * (y - x) / 3);
            vert = this.rand(start, end);
        }

        for(let i = this.posToWall(r1)-1; i <= this.posToWall(r2)+1; i++) {
            for(let j = this.posToWall(c1)-1; j <= this.posToWall(c2)+1; j++) {
                if((i == this.posToWall(horiz)) || (j == this.posToWall(vert))) {
                    this.maze[i][j] = ["wall"];
                }
            }
        }

        let gaps = this.shuffle([true, true, true, false]);

        /* create gaps in partition walls */

        if(gaps[0]) {
            let gapPosition = this.rand(c1, vert);
            this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
        }

        if(gaps[1]) {
            let gapPosition = this.rand(vert+1, c2+1);
            this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
        }

        if(gaps[2]) {
            let gapPosition = this.rand(r1, horiz);
            this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
        }

        if(gaps[3]) {
            let gapPosition = this.rand(horiz+1, r2+1);
            this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
        }

        /* recursively partition newly created chambers */

        this.partition(r1, horiz-1, c1, vert-1);
        this.partition(horiz+1, r2, c1, vert-1);
        this.partition(r1, horiz-1, vert+1, c2);
        this.partition(horiz+1, r2, vert+1, c2);

    }

    isGap(...cells) {
        return cells.every((array) => {
            let row, col;
            [row, col] = array;
            if(this.maze[row][col].length > 0) {
                if(!this.maze[row][col].includes("door")) {
                    return false;
                }
            }
            return true;
        });
    }

    countSteps(array, r, c, val, stop) {

        if(!this.inBounds(r, c)) {
            return false; /* out of bounds */
        }

        if(array[r][c] <= val) {
            return false; /* shorter route already mapped */
        }

        if(!this.isGap([r, c])) {
            return false; /* not traversable */
        }

        array[r][c] = val;

        if(this.maze[r][c].includes(stop)) {
            return true; /* reached destination */
        }

        this.countSteps(array, r-1, c, val+1, stop);
        this.countSteps(array, r, c+1, val+1, stop);
        this.countSteps(array, r+1, c, val+1, stop);
        this.countSteps(array, r, c-1, val+1, stop);

    }

    getKeyLocation() {

        let fromEntrance = this.initArray();
        let fromExit = this.initArray();

        this.totalSteps = -1;

        for(let j = 1; j < this.cols-1; j++) {
            if(this.maze[this.rows-1][j].includes("entrance")) {
                this.countSteps(fromEntrance, this.rows-1, j, 0, "exit");
            }
            if(this.maze[0][j].includes("exit")) {
                this.countSteps(fromExit, 0, j, 0, "entrance");
            }
        }

        let fc = -1, fr = -1;

        this.maze.forEach((row, r) => {
            row.forEach((cell, c) => {
                if(typeof fromEntrance[r][c] == "undefined") {
                    return;
                }
                let stepCount = fromEntrance[r][c] + fromExit[r][c];
                if(stepCount > this.totalSteps) {
                    fr = r;
                    fc = c;
                    this.totalSteps = stepCount;
                }
            });
        });

        return [fr, fc];
    }

    placeKey() {

        let fr, fc;
        [fr, fc] = this.getKeyLocation();

        this.maze[fr][fc] = ["key"];

    }

    display(id) {

        this.parentDiv = document.getElementById(id);

        if(!this.parentDiv) {
            alert("Cannot initialise maze - no element found with id \"" + id + "\"");
            return false;
        }

        while(this.parentDiv.firstChild) {
            this.parentDiv.removeChild(this.parentDiv.firstChild);
        }

        const container = document.createElement("div");
        container.id = "maze";
        container.dataset.steps = this.totalSteps;

        // ajouter une classe si on a la clé (utile pour l'UI)
        if(this.hasKey) container.classList.add("has-key");
        else container.classList.remove("has-key");

        this.maze.forEach((row) => {
            let rowDiv = document.createElement("div");
            row.forEach((cell) => {
                let cellDiv = document.createElement("div");
                // s'assurer que cell est un tableau (par sécurité)
                if(Array.isArray(cell) && cell.length) {
                    cellDiv.className = cell.join(" ");
                }
                rowDiv.appendChild(cellDiv);
            });
            container.appendChild(rowDiv);
        });

        this.parentDiv.appendChild(container);

        return true;
    }

    /* ---------- HERO & MOUVEMENT ---------- */

    placeHero() {
        // place hero sur la case d'entrance (bottom row)
        for (let j = 1; j < this.cols - 1; j++) {
            if (Array.isArray(this.maze[this.rows - 1][j]) && this.maze[this.rows - 1][j].includes("entrance")) {
                this.hero = { r: this.rows - 1, c: j };
                // push sur la case (chaque cellule a son propre array maintenant)
                this.maze[this.hero.r][this.hero.c].push("hero");
                this.hasKey = false;
                break;
            }
        }
    }

    moveHero(dr, dc) {
        if (!this.hero) return;

        let newR = this.hero.r + dr;
        let newC = this.hero.c + dc;

        // vérif bornes
        if(!this.inBounds(newR, newC)) return;

        // s'assurer que target est un tableau
        const target = this.maze[newR][newC];
        if(!Array.isArray(target)) return;

        // empêcher d'aller dans un mur
        if(target.includes("wall")) return;

        // retirer l'ancien "hero"
        const oldCell = this.maze[this.hero.r][this.hero.c];
        this.maze[this.hero.r][this.hero.c] = oldCell.filter(v => v !== "hero");
        if(this.maze[this.hero.r][this.hero.c].length === 0) this.maze[this.hero.r][this.hero.c] = [];

        // mise à jour position
        this.hero = { r: newR, c: newC };

        // si il y a une clé -> prendre la clé
        if(this.maze[newR][newC].includes("key")) {
            this.hasKey = true;
            // enlever la clé de la case
            this.maze[newR][newC] = this.maze[newR][newC].filter(v => v !== "key");
            if(this.maze[newR][newC].length === 0) this.maze[newR][newC] = [];
        }

        // ajouter hero à la nouvelle case
        this.maze[newR][newC].push("hero");

        // réafficher
        this.display("maze_container");

        // si on est sur la sortie et on a la clé -> victoire
        if(this.maze[newR][newC].includes("door") && this.maze[newR][newC].includes("exit") && this.hasKey) {
            const mazeEl = document.getElementById("maze");
            if(mazeEl) mazeEl.classList.add("finished");
        }
    }

}