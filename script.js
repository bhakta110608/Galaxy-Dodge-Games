// ==== Canvas & Buttons ====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const btnRestart = document.getElementById("btnRestart");

// ==== Resize canvas ====
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.7;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ==== Background Stars ====
const stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2,
    speed: 0.5 + Math.random() * 1.5,
  });
}
function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  for (let s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();

    s.x -= s.speed;
    if (s.x < 0) {
      s.x = canvas.width;
      s.y = Math.random() * canvas.height;
    }
  }
}

// ==== Load Images ====
const rocketImg = new Image();
rocketImg.src = "roket.jpg";

const obstacleImages = [];
for (let i = 1; i <= 11; i++) {
  const img = new Image();
  img.src = `planet${i}.jpg`;
  obstacleImages.push(img);
}

// ==== Load Audio ====
const bgm = new Audio("bgm.mp3");
bgm.loop = true;
bgm.volume = 0.3;

const scoreSound = new Audio("score.mp3");
const hitSound = new Audio("hit.mp3");
const gameOverSound = new Audio("gameover.mp3");

// ==== Game Variables ====
let player, obstacles, score, gameOver, lastObstacleTime;
let obstacleInterval = 1500;

// ==== Game Functions ====
function resetGame() {
  player = { x: 50, y: 100, width: 60, height: 60 };
  obstacles = [];
  score = 0;
  gameOver = false;
  lastObstacleTime = 0;
  btnRestart.style.display = "none";

  bgm.currentTime = 0;
  bgm.play();

  gameLoop();
}

function getSpeed() {
  return 20 + Math.floor(score / 5) * 0.5;
}

function moveUp() {
  if (player.y > 0) player.y -= 30;
}
function moveDown() {
  if (player.y < canvas.height - player.height) player.y += 30;
}

// Keyboard Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") moveUp();
  if (e.key === "ArrowDown") moveDown();
  if (e.key === "Enter" && gameOver) resetGame();
});

// Buttons
btnUp.addEventListener("click", moveUp);
btnDown.addEventListener("click", moveDown);
btnRestart.addEventListener("click", resetGame);

// ==== Player & Obstacles ====
function drawPlayer() {
  if (rocketImg.complete && rocketImg.naturalWidth > 0) {
    const aspect = rocketImg.width / rocketImg.height;
    const drawWidth = 60;
    const drawHeight = drawWidth / aspect;
    ctx.drawImage(rocketImg, player.x, player.y, drawWidth, drawHeight);

    // update ukuran player sesuai gambar supaya collision pas
    player.width = drawWidth;
    player.height = drawHeight;
  } else {
    ctx.fillStyle = "lime";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

function drawObstacles() {
  for (let obs of obstacles) {
    if (obs.img.complete && obs.img.naturalWidth > 0) {
      ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
  }
}

function playSound(sound) {
  const s = sound.cloneNode();
  s.play();
}

function updateObstacles() {
  let speed = getSpeed();

  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= speed;

    // Offscreen
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score++;
      playSound(scoreSound);
      continue;
    }

    // Collision detection pakai width & height
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      playSound(hitSound);
      gameOver = true;
    }
  }

  // Spawn obstacle baru
  if (performance.now() - lastObstacleTime > obstacleInterval) {
    let baseSize = 60 + Math.random() * 40;
    let img = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];

    // jaga aspect ratio
    let aspect = img.width / img.height || 1;
    let width = baseSize;
    let height = width / aspect;
    let y = Math.random() * (canvas.height - height);

    obstacles.push({ x: canvas.width, y: y, width: width, height: height, img: img });
    lastObstacleTime = performance.now();
  }
}

// ==== Game Loop ====
function gameLoop() {
  if (gameOver) {
    bgm.pause();
    playSound(gameOverSound);

    ctx.fillStyle = "white";
    ctx.font = "bold 28px 'Press Start 2P', cursive";
    ctx.textAlign = "center";
    ctx.fillText("🚀 Game Over 🚀", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 30);

    btnRestart.style.display = "block";
    return;
  }

  drawBackground();
  drawPlayer();
  drawObstacles();
  updateObstacles();

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "16px 'Press Start 2P', cursive";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 10, 25);
  ctx.fillText("Speed: " + getSpeed().toFixed(1), 10, 50);

  requestAnimationFrame(gameLoop);
}

// ==== Auto Start ====
window.onload = () => {
  resetGame(); // langsung mulai begitu halaman terbuka
};
