const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");

let score = 0;
let enemies = [];
let bullets = [];

// move player
document.addEventListener("keydown", (e) => {
    const left = parseInt(window.getComputedStyle(player).getPropertyValue("left"));
    if (e.key === "ArrowLeft" && left > 0) {
        player.style.left = left - 20 + "px";
    } else if (e.key === "ArrowRight" && left < 360) {
        player.style.left = left + 20 + "px";
    } else if (e.key === " ") {
        shoot(left + 18, 480);
    }
});

// create enemy
function createEnemy(x, y) {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.style.left = x + "px";
    enemy.style.top = y + "px";
    game.appendChild(enemy);
    enemies.push(enemy);
}

// shoot bullet
function shoot(x, y) {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = x + "px";
    bullet.style.top = y + "px";
    game.appendChild(bullet);
    bullets.push(bullet);
}

// move enemies down
function moveEnemies() {
    enemies.forEach((enemy, index) => {
        let top = parseInt(enemy.style.top);
        enemy.style.top = top + 2 + "px";

        if (top > 480) {
            game.removeChild(enemy);
            enemies.splice(index, 1);
        }
    });
}

// move bullets up
function moveBullets() {
    bullets.forEach((bullet, bIndex) => {
        let top = parseInt(bullet.style.top);
        bullet.style.top = top - 5 + "px";

        // remove bullet if off-screen
        if (top < 0) {
            game.removeChild(bullet);
            bullets.splice(bIndex, 1);
        }

        // collision check
        enemies.forEach((enemy, eIndex) => {
            const bRect = bullet.getBoundingClientRect();
            const eRect = enemy.getBoundingClientRect();
            if (!(bRect.right < eRect.left ||
                bRect.left > eRect.right ||
                bRect.bottom < eRect.top ||
                bRect.top > eRect.bottom)) {
                // hit!
                game.removeChild(enemy);
                enemies.splice(eIndex, 1);
                if (bullet.parentNode) game.removeChild(bullet);
                bullets.splice(bIndex, 1);
                score++;
                scoreDisplay.innerText = `Score: ${score}`;
            }
        });
    });
}

// game loop
setInterval(() => {
    moveEnemies();
    moveBullets();
}, 30);

// spawn enemies
setInterval(() => {
    const x = Math.floor(Math.random() * 370);
    createEnemy(x, 0);
}, 2000);