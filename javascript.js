// -----------------------------
// Select elements
// -----------------------------
const startButton = document.querySelector('.start-btn');
const wrapper = document.querySelector('.button-gif-wrapper');
const menu = document.getElementById('menu');
const chooseName = document.getElementById('choose-name');
const gameScreen = document.getElementById('game'); // fixed
const music = document.getElementById('bg-music');
const muteBtns = document.querySelectorAll('.mute-btn'); // all mute buttons
const player = document.getElementById('player');
const characterButtons = document.querySelectorAll('.char-btn'); // fixed

let selectedCharacter = null;
let y = 300;
let gameStarted = false;

// -----------------------------
// Button hover & press effects
// -----------------------------
startButton.addEventListener('mouseenter', () => wrapper.style.transform = 'translateY(6px)');
startButton.addEventListener('mouseleave', () => wrapper.style.transform = 'translateY(0)');
startButton.addEventListener('mousedown', () => wrapper.style.transform = 'translateY(10px)');
startButton.addEventListener('mouseup', () => wrapper.style.transform = 'translateY(6px)');

characterButtons.forEach(btn => {
  btn.addEventListener('mousedown', () => btn.style.transform = 'translateY(2px)');
  btn.addEventListener('mouseup', () => btn.style.transform = 'translateY(0)');
});

// -----------------------------
// Web Audio API setup for click SFX
// -----------------------------
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let clickBuffer = null;

fetch('audio/Button_SFX.mp3')
  .then(res => res.arrayBuffer())
  .then(buf => audioContext.decodeAudioData(buf))
  .then(decoded => clickBuffer = decoded)
  .catch(err => console.error('Failed to load click sound:', err));

function playClickSound() {
  if (!clickBuffer) return;
  const source = audioContext.createBufferSource();
  source.buffer = clickBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}

// Apply click sound to all buttons except mute
document.querySelectorAll('button').forEach(btn => {
  if (!btn.classList.contains('mute-btn')) btn.addEventListener('click', playClickSound);
});

// -----------------------------
// START button click: play music & switch screens
// -----------------------------
startButton.addEventListener('click', () => {
  menu.style.display = 'none';
  chooseName.style.display = 'block';

  if (music.paused) {
    music.volume = 0.3;
    music.play();
  }
});

// -----------------------------
// Mute/unmute buttons
// -----------------------------
muteBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (music.paused) {
      music.play();
      btn.textContent = '🔊';
    } else {
      music.pause();
      btn.textContent = '🔇';
    }
  });
});

// -----------------------------
// Character selection -> store in sessionStorage
// -----------------------------
const characterSprites = {
  chef: 'images/chefidle.gif',
  uniform: 'images/uniformidle.gif',
  casual: 'images/casualidle.gif'
};

characterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedCharacter = btn.dataset.character || 'chef';

    // Store selected character in sessionStorage
    sessionStorage.setItem("selectedCharacter", selectedCharacter);

    chooseName.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Redirect to game.html after character selection
    window.location.href = "game.html"; // Redirect to game.html immediately
  });
});


function startGame() {
  gameStarted = true;
  player.src = characterSprites[selectedCharacter];
  player.style.position = 'absolute';
  player.style.left = '120px';
  player.style.top = y + 'px';
  player.style.width = '180px';
  player.style.imageRendering = 'pixelated';
}

// -----------------------------
// Player movement
// -----------------------------
document.addEventListener('keydown', e => {
  if (!gameStarted) return;

  if (e.key === 'ArrowUp') y -= 15;
  if (e.key === 'ArrowDown') y += 15;

  // boundaries
  const minY = 100;
  const maxY = window.innerHeight - 200;
  y = Math.max(minY, Math.min(maxY, y));

  player.style.top = y + 'px';
});
