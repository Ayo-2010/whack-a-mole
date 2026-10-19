const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const bestEl = document.getElementById('best');
const startBtn = document.getElementById('startBtn');

const HOLES = 9;
const ROUND_SECONDS = 30;

let moles = [];
let score = 0;
let time = ROUND_SECONDS;
let running = false;
let spawnTimer = null;
let hideTimer = null;
let clockTimer = null;
let activeIndex = -1;

let best = Number(localStorage.getItem('whackBest') || 0);
bestEl.textContent = best;

for (let index = 0; index < HOLES; index++) {
  const hole = document.createElement('div');
  hole.className = 'hole';

  const mole = document.createElement('button');
  mole.type = 'button';
  mole.className = 'mole';
  mole.dataset.index = String(index);
  mole.setAttribute('aria-label', 'Mole');
  mole.innerHTML = '<span class="face"></span><span class="nose"></span>';
  mole.addEventListener('click', () => hit(index));

  hole.appendChild(mole);
  board.appendChild(hole);
  moles.push(mole);
}

function clearTimers() {
  clearTimeout(spawnTimer);
  clearTimeout(hideTimer);
  clearInterval(clockTimer);
  spawnTimer = null;
  hideTimer = null;
  clockTimer = null;
}

function showMole() {
  if (!running) return;

  const open = moles.map((mole, index) => (index === activeIndex ? -1 : index)).filter((index) => index >= 0);
  const index = open[Math.floor(Math.random() * open.length)];
  const mole = moles[index];
  const gap = Math.max(430, 880 - (ROUND_SECONDS - time) * 16);
  const life = Math.max(300, gap - 130);

  activeIndex = index;
  mole.classList.add('up');

  hideTimer = setTimeout(() => {
    mole.classList.remove('up');
    if (activeIndex === index) activeIndex = -1;
  }, life);
}

function loop() {
  if (!running) return;
  showMole();
  const gap = Math.max(430, 880 - (ROUND_SECONDS - time) * 16);
  spawnTimer = setTimeout(loop, gap);
}

function hit(index) {
  if (!running) return;

  const mole = moles[index];
  if (!mole.classList.contains('up')) return;

  score++;
  scoreEl.textContent = score;
  mole.classList.remove('up');
  mole.classList.add('bonk');
  setTimeout(() => mole.classList.remove('bonk'), 160);
  if (activeIndex === index) activeIndex = -1;
}

function endGame() {
  running = false;
  clearTimers();
  activeIndex = -1;
  moles.forEach((mole) => mole.classList.remove('up'));
  statusEl.textContent = `Time is up — you scored ${score}.`;
  startBtn.textContent = 'Play again';

  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem('whackBest', String(best));
  }
}

function startGame() {
  clearTimers();
  running = true;
  score = 0;
  time = ROUND_SECONDS;
  activeIndex = -1;

  scoreEl.textContent = '0';
  timerEl.textContent = String(ROUND_SECONDS);
  statusEl.textContent = 'Go! Whack every mole you see.';
  startBtn.textContent = 'Restart';

  moles.forEach((mole) => mole.classList.remove('up'));
  loop();

  clockTimer = setInterval(() => {
    time--;
    timerEl.textContent = Math.max(0, time);
    if (time <= 0) endGame();
  }, 1000);
}

startBtn.addEventListener('click', startGame);

const helpTrigger = document.getElementById('helpBtn');
const helpOverlay = document.getElementById('helpModal');
const helpCloseBtn = document.getElementById('helpClose');

function openHelp() {
  helpOverlay.hidden = false;
  document.body.classList.add('help-open');
  helpCloseBtn.focus();
}

function closeHelp() {
  if (helpOverlay.hidden) return;

  helpOverlay.hidden = true;
  document.body.classList.remove('help-open');
  helpTrigger.focus();
}

helpTrigger.addEventListener('click', openHelp);
helpCloseBtn.addEventListener('click', closeHelp);
helpOverlay.querySelectorAll('[data-close]').forEach((element) => {
  element.addEventListener('click', closeHelp);
});

document.addEventListener('keydown', (event) => {
  if (helpOverlay.hidden) return;

  if (event.key === 'Escape') {
    closeHelp();
    event.stopImmediatePropagation();
    return;
  }

  if (event.key !== 'Tab') {
    event.preventDefault();
  }

  event.stopImmediatePropagation();
}, true);
