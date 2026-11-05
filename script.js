const screenStage = document.querySelector("#screen-stage");
const screens = [...document.querySelectorAll(".screen")]
  .sort((left, right) => Number(left.dataset.screen) - Number(right.dataset.screen));
screens.forEach((screen) => screenStage.append(screen));
const dots = [...document.querySelectorAll(".progress-dot")];
const backButton = document.querySelector("#nav-back");
const nextButton = document.querySelector("#nav-next");
let currentScreen = 0;
let candleBlown = false;
let jisooQuizComplete = false;
const visitTrackingConfig = {
  supabaseUrl: "https://pysxmsxcmuvvqlszerfi.supabase.co",
  publishableKey: "sb_publishable_TZW7Kt-dPBVLdmm6BrJB3g_JPDhZeVo"
};
const visitConsent = document.querySelector("#visit-consent");
const prizeProgressKey = "akshatha-birthday-prize-progress";
const prizeProgress = JSON.parse(localStorage.getItem(prizeProgressKey) || '{"brain":false,"meowdoku":false}');

async function recordVisit(name) {
  const { supabaseUrl, publishableKey } = visitTrackingConfig;
  if (!supabaseUrl || !publishableKey) {
    throw new Error("Visit logging is not configured yet. Ask Raj to finish setting it up.");
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/birthday_visits`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ visitor_name: name })
  });
  if (!response.ok) throw new Error(`Visit logging failed with status ${response.status}.`);
}

const visitConsentForm = document.querySelector("#visit-consent-form");
const visitNameInput = document.querySelector("#visitor-name");
const visitConsentError = document.querySelector("#visit-consent-error");
visitConsentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = visitNameInput.value.trim();
  if (!name) {
    visitNameInput.setCustomValidity("Please enter a name or nickname.");
    visitNameInput.reportValidity();
    return;
  }
  visitNameInput.setCustomValidity("");
  if (!document.querySelector("#visit-consent-check").checked) return;

  const submitButton = document.querySelector("#visit-consent-accept");
  submitButton.disabled = true;
  visitConsentError.hidden = true;
  try {
    await recordVisit(name);
    visitConsent.close();
  } catch (error) {
    console.error("Could not save this visit.", error);
    visitConsentError.textContent = error.message || "Could not save your visit. Please try again.";
    visitConsentError.hidden = false;
  } finally {
    submitButton.disabled = false;
  }
});
visitConsent.addEventListener("cancel", (event) => {
  event.preventDefault();
});
document.querySelector("#visit-privacy-settings").addEventListener("click", () => visitConsent.showModal());
visitConsent.showModal();

function updatePrizeProgress() {
  const completed = Number(prizeProgress.brain) + Number(prizeProgress.meowdoku);
  const unlocked = completed === 2;
  document.querySelector("#gift-hunt-status").textContent = unlocked
    ? "your Myntra gift is unlocked!"
    : `Complete the brain challenge and Meowdoku to unlock your prize. ${completed}/2 complete.`;
  document.querySelector("#gift-wrap-button").disabled = !unlocked;
  document.querySelector("#gift-wrap-button").textContent = unlocked ? "Open your Myntra gift 🎁" : `🔒 Your birthday gift · ${completed}/2`;
  updateNavigation();
}

function completePrizeChallenge(challenge) {
  prizeProgress[challenge] = true;
  localStorage.setItem(prizeProgressKey, JSON.stringify(prizeProgress));
  updatePrizeProgress();
}

updatePrizeProgress();

function canAdvanceFromCurrentScreen() {
  if (currentScreen === 0) return candleBlown;
  if (currentScreen === 4) return prizeProgress.brain;
  if (currentScreen === 5) return jisooQuizComplete;
  if (currentScreen === 6) return prizeProgress.meowdoku;
  return true;
}

function updateNavigation() {
  if (!nextButton) return;
  nextButton.disabled = currentScreen === screens.length - 1 || !canAdvanceFromCurrentScreen();
}

function showScreen(index) {
  const requestedScreen = Math.max(0, Math.min(index, screens.length - 1));
  if (requestedScreen > currentScreen && !canAdvanceFromCurrentScreen()) return;
  currentScreen = requestedScreen;
  screens.forEach((screen, screenIndex) => {
    const isActive = screenIndex === currentScreen;
    screen.hidden = !isActive;
    screen.classList.toggle("active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });
  screens[currentScreen].scrollTop = 0;
  dots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === currentScreen;
    dot.classList.toggle("active", isActive);
    if (isActive) dot.setAttribute("aria-current", "step");
    else dot.removeAttribute("aria-current");
  });
  backButton.disabled = currentScreen === 0;
  updateNavigation();
}

document.querySelectorAll(".next-button").forEach((button) => {
  button.addEventListener("click", () => showScreen(currentScreen + 1));
});
backButton.addEventListener("click", () => showScreen(currentScreen - 1));
nextButton.addEventListener("click", () => showScreen(currentScreen + 1));

const confettiLayer = document.querySelector("#confetti-layer");
function celebrate() {
  const pieces = ["♡", "♥", "♡", "✦", "♡"];
  const colors = ["#ed79a4", "#f7bfd3", "#e7a5bf", "#ffdae7", "#d985a7"];
  for (let index = 0; index < 180; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = pieces[index % pieces.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.color = colors[index % colors.length];
    piece.style.fontSize = `${14 + Math.random() * 12}px`;
    piece.style.animationDuration = `${2 + Math.random() * 0.6}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    confettiLayer.append(piece);
    window.setTimeout(() => piece.remove(), 3100);
  }
}

const birthdayLetter = {
  salutation: "Dear Akshatha,",
  paragraphs: [
  "Happy birthday to my favourite smart, beautiful person! ❤️",
  "You have this way of making hard things look easy, making people feel at home, and making an ordinary day a lot more fun. I hope this year brings you exciting moments, lots of laughter, and plenty of reasons to feel proud of yourself. You deserve all of it.",
  "Keep being curious, ambitious, and completely yourself. I'm always impressed by how smart you are. Honestly, English needs more adjectives because the existing ones aren't enough to describe you! 😂",
  "Sending you the biggest birthday wishes! ❤️"
],
  signoff: "Cheering you on, always. ♡"
};
document.querySelector("#letter-salutation").textContent = birthdayLetter.salutation;
const letterParagraphs = document.querySelector("#letter-paragraphs");
birthdayLetter.paragraphs.forEach((text) => {
  const paragraph = document.createElement("p");
  paragraph.className = "note-copy";
  paragraph.textContent = text;
  letterParagraphs.append(paragraph);
});
document.querySelector("#letter-signoff").textContent = birthdayLetter.signoff;
document.querySelector("#letter-open").addEventListener("click", (event) => {
  document.querySelector(".letter-envelope").classList.add("opened");
  document.querySelector("#letter-reveal").hidden = false;
  event.currentTarget.textContent = "Your letter ♡";
  event.currentTarget.disabled = true;
});

document.querySelectorAll(".cake-candle").forEach((candle) => {
  candle.addEventListener("click", () => {
    candle.classList.add("extinguished");
    candle.disabled = true;
    candleBlown = true;
    document.querySelector("#cake-hint").hidden = true;
    document.querySelector("#cake-wish").hidden = false;
    document.querySelector("#birthday-edit-button").disabled = false;
    updateNavigation();
    celebrate();
  });
});

const jisooQuestions = [
  {
    question: "What is the title of Jisoo's first solo single album?",
    options: ["FLOWER", "ME", "All Eyes On Me"],
    answer: 1
  },
  {
    question: "Which track appears alongside FLOWER on the ME single album?",
    options: ["All Eyes On Me", "Gone", "You & Me"],
    answer: 0
  },
  {
    question: "On what date was Jisoo's solo single album ME released?",
    options: ["March 31, 2023", "April 1, 2023", "March 31, 2022"],
    answer: 0
  }
];
let jisooQuestionIndex = 0;
let jisooAnswered = false;
const jisooOptions = document.querySelector("#jisoo-options");
function renderJisooQuestion() {
  const currentQuestion = jisooQuestions[jisooQuestionIndex];
  jisooAnswered = false;
  document.querySelector("#jisoo-quiz-progress").textContent = `${jisooQuestionIndex + 1} / ${jisooQuestions.length}`;
  document.querySelector("#jisoo-question").textContent = currentQuestion.question;
  document.querySelector("#jisoo-feedback").textContent = "";
  document.querySelector("#jisoo-next").hidden = true;
  jisooOptions.replaceChildren();
  currentQuestion.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jisoo-option";
    button.textContent = option;
    button.addEventListener("click", () => {
      if (jisooAnswered) return;
      jisooAnswered = true;
      if (jisooQuestionIndex === jisooQuestions.length - 1) {
        jisooQuizComplete = true;
        updateNavigation();
      }
      const correct = optionIndex === currentQuestion.answer;
      button.classList.add(correct ? "correct" : "incorrect");
      jisooOptions.querySelectorAll("button").forEach((answer) => { answer.disabled = true; });
      if (correct) jisooOptions.children[currentQuestion.answer].classList.add("correct");
      document.querySelector("#jisoo-feedback").textContent = correct ? "Correct. Excellent taste in pop culture. ✦" : `Not quite — ${currentQuestion.options[currentQuestion.answer]} is the answer.`;
      const nextButton = document.querySelector("#jisoo-next");
      nextButton.hidden = false;
      nextButton.textContent = jisooQuestionIndex === jisooQuestions.length - 1
        ? "Continue to Meowdoku →"
        : "Next question →";
    });
    jisooOptions.append(button);
  });
}
document.querySelector("#jisoo-next").addEventListener("click", () => {
  if (jisooQuestionIndex === jisooQuestions.length - 1) {
    showScreen(currentScreen + 1);
    return;
  }
  jisooQuestionIndex = (jisooQuestionIndex + 1) % jisooQuestions.length;
  renderJisooQuestion();
});
renderJisooQuestion();
document.querySelectorAll(".spotlight-choice").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#spotlight-result").textContent =
      button.dataset.spotlight === "Akshatha"
        ? "Correct answer. Akshatha owns the spotlight today. 😂"
        : "Jisoo is iconic, but today the crown belongs to Akshatha. 😂";
  });
});

const geniusQuestions = [
  {
    prompt: "A bat and a ball cost ₹110 together. The bat costs ₹100 more than the ball. How much is the ball?",
    options: ["₹5", "₹10", "₹15", "₹20"],
    answer: 0,
    explanation: "₹5 — the bat costs ₹105, which is ₹100 more."
  },
  {
    prompt: "What comes next? 2, 6, 12, 20, ...",
    options: ["24", "28", "30", "32"],
    answer: 2,
    explanation: "30. The differences increase by two: +4, +6, +8, +10."
  },
  {
    prompt: "What gets wetter the more it dries?",
    options: ["A cloud", "A towel", "A river", "A sponge"],
    answer: 1,
    explanation: "A towel. A classic."
  },
  {
    prompt: "Complete the pattern: ▲, ■, ▲▲, ■■, ▲▲▲, ...",
    options: ["▲▲▲▲", "■■■", "▲■▲", "■■■■"],
    answer: 1,
    explanation: "■■■ — the shape alternates, while the count increases."
  },
  {
    prompt: "A ₹500 book is discounted by 20%. What is its sale price?",
    options: ["₹350", "₹380", "₹400", "₹420"],
    answer: 2,
    explanation: "₹400. Twenty percent of ₹500 is ₹100."
  }
];
let geniusIndex = 0;
let geniusScore = 0;
let geniusAnswered = false;
const geniusQuiz = document.querySelector("#genius-quiz");
const geniusOptions = document.querySelector("#genius-options");
function renderGeniusQuestion() {
  const question = geniusQuestions[geniusIndex];
  geniusAnswered = false;
  document.querySelector("#genius-progress-label").textContent = `QUESTION ${geniusIndex + 1} OF ${geniusQuestions.length}`;
  document.querySelector("#genius-score").textContent = `${geniusScore} correct`;
  document.querySelector("#genius-progress-bar").style.width = `${(geniusIndex / geniusQuestions.length) * 100}%`;
  document.querySelector("#genius-question").textContent = question.prompt;
  document.querySelector("#genius-feedback").textContent = "";
  document.querySelector("#genius-next").hidden = true;
  document.querySelector("#genius-result").hidden = true;
  geniusOptions.replaceChildren();
  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "genius-option";
    button.textContent = option;
    button.addEventListener("click", () => {
      if (geniusAnswered) return;
      geniusAnswered = true;
      const correct = optionIndex === question.answer;
      if (correct) geniusScore += 1;
      geniusOptions.querySelectorAll("button").forEach((answer) => { answer.disabled = true; });
      geniusOptions.children[question.answer].classList.add("correct");
      if (!correct) button.classList.add("incorrect");
      document.querySelector("#genius-score").textContent = `${geniusScore} correct`;
      document.querySelector("#genius-feedback").textContent = `${correct ? "Okay Einstein, we get it." : "Let's blame the birthday excitement."} ${question.explanation}`;
      document.querySelector("#genius-next").hidden = false;
      document.querySelector("#genius-next").textContent = geniusIndex === geniusQuestions.length - 1 ? "See your result →" : "Next question →";
    });
    geniusOptions.append(button);
  });
}
document.querySelector("#genius-start").addEventListener("click", (event) => {
  geniusQuiz.hidden = false;
  event.currentTarget.hidden = true;
  renderGeniusQuestion();
});
document.querySelector("#genius-next").addEventListener("click", () => {
  if (!geniusAnswered) return;
  if (geniusIndex === geniusQuestions.length - 1) {
    geniusOptions.hidden = true;
    document.querySelector("#genius-question").hidden = true;
    document.querySelector("#genius-feedback").hidden = true;
    document.querySelector("#genius-next").hidden = true;
    document.querySelector("#genius-progress-bar").style.width = "100%";
    const result = document.querySelector("#genius-result");
    result.hidden = false;
    document.querySelector("#genius-result-title").textContent = `Birthday Genius Points: ${geniusScore}/5`;
    document.querySelector("#genius-result-copy").textContent =
      geniusScore === 5 ? "NASA wants your contact details. 📡" : `${geniusScore === 0 ? "A perfect excuse for more cake." : "Not bad at all — birthday brain is in good form."}`;
    completePrizeChallenge("brain");
    return;
  }
  geniusIndex += 1;
  renderGeniusQuestion();
});
document.querySelector("#genius-replay").addEventListener("click", () => {
  geniusIndex = 0;
  geniusScore = 0;
  geniusOptions.hidden = false;
  document.querySelector("#genius-question").hidden = false;
  document.querySelector("#genius-feedback").hidden = false;
  renderGeniusQuestion();
});

const puzzleTemplates = [
  {
    regions: [
      [0, 0, 0, 1, 1],
      [0, 1, 1, 1, 2],
      [0, 2, 2, 2, 2],
      [3, 3, 3, 3, 4],
      [3, 4, 4, 4, 4]
    ],
    solution: [0, 2, 4, 1, 3]
  },
  {
    regions: [
      [1, 1, 0, 0, 0],
      [2, 1, 1, 1, 0],
      [2, 2, 2, 2, 0],
      [4, 3, 3, 3, 3],
      [4, 4, 4, 4, 3]
    ],
    solution: [4, 2, 0, 3, 1]
  },
  {
    regions: [
      [4, 4, 4, 4, 3],
      [4, 3, 3, 3, 3],
      [2, 2, 2, 2, 0],
      [2, 1, 1, 1, 0],
      [1, 1, 0, 0, 0]
    ],
    solution: [1, 3, 0, 2, 4]
  }
];
const regionColors = ["rose", "peach", "lilac", "sage", "blue"];
const grid = document.querySelector("#cat-grid");
const gameStatus = document.querySelector("#game-status");
const gameHint = document.querySelector("#game-hint");
const gameLives = document.querySelector("#game-lives");
let puzzleIndex = 0;
let puzzle = puzzleTemplates[puzzleIndex];
let board = Array(25).fill("unknown");
let selectedCell = -1;
let gameMode = "place";
let mistakes = 0;
let hintsUsed = 0;
let gameStartedAt = 0;
let gameTimerId = null;
let gameFinished = false;
let lastTapIndex = -1;
let lastTapAt = 0;

function updateGameTimer() {
  if (!gameStartedAt || gameFinished) return;
  const totalSeconds = Math.floor((Date.now() - gameStartedAt) / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  document.querySelector("#game-timer").textContent = `${minutes}:${seconds}`;
}

function startGameTimer() {
  if (gameStartedAt) return;
  gameStartedAt = Date.now();
  gameTimerId = window.setInterval(updateGameTimer, 1000);
}

function updateLives() {
  const remaining = Math.max(0, 3 - mistakes);
  gameLives.textContent = Array.from({ length: 3 }, (_, index) => index < remaining ? "♥" : "♡").join(" ");
  gameLives.setAttribute("aria-label", `${remaining} ${remaining === 1 ? "chance" : "chances"} remaining`);
  document.querySelector("#game-mistakes").textContent = `${mistakes} / 3`;
  const found = board.filter((value) => value === "cat").length;
  document.querySelector("#game-points").textContent = Math.max(0, found * 100 - mistakes * 50 - hintsUsed * 10);
  document.querySelector("#game-progress-label").textContent = `${found} / 5 cats found`;
  document.querySelector("#game-progress-bar").style.width = `${found * 20}%`;
}

function renderBoard() {
  grid.replaceChildren();
  puzzle.regions.forEach((row, rowIndex) => {
    row.forEach((region, columnIndex) => {
      const index = rowIndex * 5 + columnIndex;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `cat-cell territory-${regionColors[region]}`;
      cell.setAttribute("role", "gridcell");
      cell.dataset.row = rowIndex;
      cell.dataset.column = columnIndex;
      cell.dataset.region = region;
      cell.setAttribute("aria-label", `Row ${rowIndex + 1}, column ${columnIndex + 1}, color territory ${region + 1}, ${board[index] === "cat" ? "cat" : board[index] === "empty" || board[index] === "wrong" ? "marked empty" : "unmarked"}`);
      if (board[index] === "cat") {
        cell.innerHTML = catSvg;
        cell.classList.add("has-cat");
      } else if (board[index] === "empty" || board[index] === "wrong") {
        cell.textContent = "×";
        cell.classList.add(board[index] === "wrong" ? "wrong-guess" : "marked-empty");
      }
      if (index === selectedCell) cell.classList.add("selected");
      if (cell.dataset.hinted === "true") cell.classList.add("hinted");
      cell.addEventListener("click", () => handleCellTap(index));
      cell.addEventListener("dblclick", (event) => event.preventDefault());
      cell.disabled = gameFinished || board[index] === "cat" || board[index] === "wrong";
      grid.append(cell);
    });
  });
}

const catSvg = '<svg viewBox="0 0 48 48" class="cat-token" role="img" aria-label="Cat"><path d="M8 21 9 8l11 7a18 18 0 0 1 8 0l11-7 1 13a16 16 0 0 1 2 8c0 10-8 15-18 15S6 39 6 29a16 16 0 0 1 2-8Z" fill="#fffafc" stroke="#8d546a" stroke-width="2.4" stroke-linejoin="round"/><path d="M17 29h.2m13 0h.2" stroke="#573847" stroke-width="3.5" stroke-linecap="round"/><path d="m22 34 2 2 2-2m-13-1-5-1m5 4-5 1m29-4 5-1m-5 4 5 1" fill="none" stroke="#c66b8f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 24q3-3 6 0" fill="none" stroke="#d88aa5" stroke-width="2" stroke-linecap="round"/></svg>';

function startTimerOnPlay() {
  startGameTimer();
}

function handleCellTap(index) {
  if (gameFinished) return;
  const now = Date.now();
  const isDoubleTap = index === lastTapIndex && now - lastTapAt < 360;
  lastTapIndex = index;
  lastTapAt = now;
  selectedCell = index;

  if (gameMode === "mark") {
    startTimerOnPlay();
    if (board[index] === "empty") board[index] = "unknown";
    else if (board[index] === "unknown") board[index] = "empty";
    gameStatus.textContent = "";
  } else if (gameMode === "erase") {
    if (board[index] !== "wrong") board[index] = "unknown";
    gameStatus.textContent = "";
  } else if (isDoubleTap) {
    placeCat(index);
    lastTapIndex = -1;
  } else {
    gameStatus.textContent = "Tile selected. Double-tap or choose Place cat.";
  }
  renderBoard();
}

function violatesRules(index) {
  const row = Math.floor(index / 5);
  const column = index % 5;
  const region = puzzle.regions[row][column];
  return board.some((value, otherIndex) => {
    if (value !== "cat") return false;
    const otherRow = Math.floor(otherIndex / 5);
    const otherColumn = otherIndex % 5;
    const otherRegion = puzzle.regions[otherRow][otherColumn];
    return otherRow === row || otherColumn === column || otherRegion === region ||
      (Math.abs(otherRow - row) <= 1 && Math.abs(otherColumn - column) <= 1);
  });
}

function placeCat(index = selectedCell) {
  if (gameFinished) return;
  if (index < 0) {
    gameStatus.textContent = "Select a tile first.";
    return;
  }
  startTimerOnPlay();
  if (board[index] === "cat" || board[index] === "wrong") {
    gameStatus.textContent = "Choose an unmarked tile.";
    return;
  }
  if (violatesRules(index)) {
    mistakes += 1;
    updateLives();
    gameStatus.textContent = "Cats need their own row, column, territory & personal space.";
    const cell = grid.children[index];
    cell.classList.add("rule-conflict");
    window.setTimeout(() => cell.classList.remove("rule-conflict"), 700);
    if (mistakes >= 3) endGame(false);
    return;
  }

  const row = Math.floor(index / 5);
  const column = index % 5;
  if (puzzle.solution[row] !== column) {
    mistakes += 1;
    board[index] = "wrong";
    updateLives();
    gameStatus.textContent = mistakes >= 3 ? "Out of chances — start a new board when you're ready." : "No cat there. One chance used — trust your logic!";
    if (mistakes >= 3) endGame(false);
    renderBoard();
    return;
  }

  board[index] = "cat";
  updateLives();
  gameStatus.textContent = "A perfect deduction. Nicely done.";
  renderBoard();
  const placed = board.filter((value) => value === "cat").length;
  if (placed === 5) endGame(true);
}

function endGame(won) {
  gameFinished = true;
  window.clearInterval(gameTimerId);
  gameTimerId = null;
  if (won) {
    gameStatus.textContent = "All five cats found!";
    gameHint.textContent = "Every cat has its own row, column, territory & personal space.";
    document.querySelector("#game-complete").hidden = false;
    completePrizeChallenge("meowdoku");
    celebrate();
  }
  renderBoard();
}

function setGameMode(mode) {
  gameMode = mode;
  const controls = [
    [document.querySelector("#cat-place"), "place"],
    [document.querySelector("#cat-mark"), "mark"],
    [document.querySelector("#cat-erase"), "erase"]
  ];
  controls.forEach(([button, buttonMode]) => {
    const active = buttonMode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

document.querySelector("#cat-place").addEventListener("click", () => {
  setGameMode("place");
  if (selectedCell >= 0) placeCat(selectedCell);
});
document.querySelector("#cat-mark").addEventListener("click", () => setGameMode("mark"));
document.querySelector("#cat-erase").addEventListener("click", () => {
  if (selectedCell >= 0 && board[selectedCell] !== "wrong") {
    board[selectedCell] = "unknown";
    gameStatus.textContent = "";
    renderBoard();
    updateLives();
  }
  setGameMode("erase");
});
document.querySelector("#game-hint-button").addEventListener("click", () => {
  if (gameFinished) return;
  const nextRow = board.findIndex((value, rowIndex) => value !== "cat" && !board.slice(rowIndex * 5, rowIndex * 5 + 5).includes("cat"));
  if (nextRow < 0) return;
  const hintCell = nextRow * 5 + puzzle.solution[nextRow];
  selectedCell = hintCell;
  hintsUsed += 1;
  updateLives();
  gameStatus.textContent = `Hint: a cat can be placed safely in row ${nextRow + 1}.`;
  renderBoard();
  const cell = grid.children[hintCell];
  cell.classList.add("hinted");
  window.setTimeout(() => cell.classList.remove("hinted"), 1800);
});
document.querySelector("#game-new").addEventListener("click", () => {
  puzzleIndex = (puzzleIndex + 1) % puzzleTemplates.length;
  puzzle = puzzleTemplates[puzzleIndex];
  board = Array(25).fill("unknown");
  selectedCell = -1;
  mistakes = 0;
  hintsUsed = 0;
  gameStartedAt = 0;
  gameFinished = false;
  lastTapIndex = -1;
  window.clearInterval(gameTimerId);
  gameTimerId = null;
  document.querySelector("#game-timer").textContent = "00:00";
  document.querySelector("#game-level").textContent = `BOARD ${puzzleIndex + 1} / ${puzzleTemplates.length}`;
  document.querySelector("#game-complete").hidden = true;
  gameHint.textContent = "Place one cat in every row, column & color territory. Cats need personal space — diagonals too.";
  gameStatus.textContent = "New board. Same very clever birthday brain.";
  updateLives();
  setGameMode("place");
  renderBoard();
});
updateLives();
renderBoard();

document.querySelector("#wish-button").addEventListener("click", (event) => {
  document.querySelector("#hidden-wish").hidden = false;
  event.currentTarget.textContent = "Cheers to you, Akshatha";
  celebrate();
});
document.querySelector("#secret-trigger").addEventListener("click", (event) => {
  const card = document.querySelector("#secret-card");
  card.hidden = false;
  event.currentTarget.hidden = true;
  celebrate();
});
document.querySelector("#gift-wrap-button").addEventListener("click", () => {
  if (document.querySelector("#gift-wrap-button").disabled) return;
  document.querySelector("#gift-reveal").hidden = false;
  document.querySelector("#gift-wrap-button").hidden = true;
  celebrate();
});
document.querySelector("#close-birthday-edit").addEventListener("click", () => showScreen(0));
document.querySelector("#replay-experience").addEventListener("click", () => showScreen(0));

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target;
  const isInteractive = target instanceof HTMLElement &&
    (target.matches("button, a, input, textarea, select, summary") || target.isContentEditable);
  const isGameCell = target instanceof HTMLElement && target.classList.contains("cat-cell");

  if (currentScreen === 6 && (!isInteractive || isGameCell)) {
    const row = selectedCell < 0 ? 0 : Math.floor(selectedCell / 5);
    const column = selectedCell < 0 ? 0 : selectedCell % 5;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (moves[event.key]) {
      event.preventDefault();
      const [rowDelta, columnDelta] = moves[event.key];
      selectedCell = Math.max(0, Math.min(4, row + rowDelta)) * 5 + Math.max(0, Math.min(4, column + columnDelta));
      renderBoard();
      grid.children[selectedCell].focus();
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && isGameCell) {
      event.preventDefault();
      placeCat(Number(target.dataset.row) * 5 + Number(target.dataset.column));
    }
    if (event.key.toLowerCase() === "x" && selectedCell >= 0) {
      board[selectedCell] = "empty";
      renderBoard();
      updateLives();
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      if (selectedCell >= 0 && board[selectedCell] !== "wrong") board[selectedCell] = "unknown";
      renderBoard();
      updateLives();
    }
  }

  if (!isInteractive && event.key === "ArrowRight" && currentScreen < screens.length - 1 &&
      (currentScreen !== 0 || candleBlown)) showScreen(currentScreen + 1);
  if (!isInteractive && event.key === "ArrowLeft" && currentScreen > 0) showScreen(currentScreen - 1);
});

showScreen(0);
