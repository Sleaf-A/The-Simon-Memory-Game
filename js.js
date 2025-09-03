const colors = ["green", "red", "yellow", "blue"];
let gameSequence = [];
let userSequence = [];
let acceptingInput = false;
let level = 0;
let highScore = localStorage.getItem("simonHighScore") || 0;

const squares = {};
colors.forEach(color => {
  squares[color] = document.getElementById(color);
  squares[color].addEventListener("click", () => handleUserClick(color));
});

const startBtn = document.getElementById("startBtn");
const message = document.getElementById("message");
const levelCounter = document.getElementById("level-counter");
const highScoreDisplay = document.getElementById("high-score");

// Show high score on load
highScoreDisplay.textContent = `High Score: ${highScore}`;

// Simon tones (Hz)
const tones = {
  green: 329.63,
  red: 261.63,
  yellow: 196.00,
  blue: 392.00,
};

function playTone(freq, duration = 500) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine"; // could use "square" for retro
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  // Fade in/out for smooth sound
  const fadeTime = 0.1;
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + fadeTime);
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + duration / 1000 - fadeTime);
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration / 1000);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

startBtn.addEventListener("click", startFunction);

function startFunction() {
  message.textContent = "";
  gameSequence = [];
  level = 0;
  startBtn.style.display = "none";
  nextRound();
}

function nextRound() {
  acceptingInput = false;
  userSequence = [];
  level++;
  levelCounter.textContent = `Level: ${level}`;

  if (level > highScore) {
    highScore = level;
    localStorage.setItem("simonHighScore", highScore);
    highScoreDisplay.textContent = `High Score: ${highScore}`;
  }

  if (level > 20) {
    message.innerHTML = "You win!";
    startBtn.style.display = "inline-block";
    startBtn.textContent = "Continue";
    return;
  }

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  gameSequence.push(randomColor);
  playSequence();
}

function playSequence() {
  let i = 0;
  const interval = setInterval(() => {
    flashSquare(gameSequence[i]);
    playTone(tones[gameSequence[i]]);
    i++;
    if (i >= gameSequence.length) {
      clearInterval(interval);
      setTimeout(() => acceptingInput = true, 500);
    }
  }, 800);
}

function flashSquare(color) {
  squares[color].classList.add("flash");
  setTimeout(() => squares[color].classList.remove("flash"), 500);
}

function handleUserClick(color) {
  if (!acceptingInput) return;

  userSequence.push(color);
  flashSquare(color);
  playTone(tones[color]);

  if (userSequence[userSequence.length - 1] !== gameSequence[userSequence.length - 1]) {
    message.textContent = `Wrong! You reached level ${level}`;
    startBtn.textContent = "Restart";
    startBtn.style.display = "inline-block";
    acceptingInput = false;
    return;
  }

  if (userSequence.length === gameSequence.length) {
    setTimeout(nextRound, 1000);
  }
}
