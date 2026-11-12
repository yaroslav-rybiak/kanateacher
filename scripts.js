const kanaField = document.getElementById('kana');
const answerField = document.getElementById('answer');
const input = document.getElementById('romaji');
const correctField = document.getElementById('correct');
const wrongField = document.getElementById('wrong');
const leftField = document.getElementById('left');

const HIRAGANA = {
    'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
    'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
    'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
    'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
    'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
    'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
    'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
    'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
    'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
    'wa': 'わ', 'wo': 'を',
};

let pool = [];
let current = null;
let correctCount = 0;
let wrongCount = 0;

function startGame() {
    pool = Object.keys(HIRAGANA).map(romaji => ({ char: HIRAGANA[romaji], romaji }));
    correctCount = 0;
    wrongCount = 0;
    answerField.textContent = '';
    input.disabled = false;
    input.value = '';
    updateCounters();
    nextTask();
    input.focus();
}

function updateCounters() {
    correctField.textContent = correctCount;
    wrongField.textContent = wrongCount;
    leftField.textContent = pool.length;
}

function nextTask() {
    if (pool.length === 0) {
        finishGame();
        return;
    }
    current = pool[Math.floor(Math.random() * pool.length)];
    kanaField.textContent = current.char;
}

function finishGame() {
    current = null;
    kanaField.textContent = 'Well done!';
    input.disabled = true;

    const restart = document.createElement('a');
    restart.href = '#';
    restart.textContent = 'Start again';
    restart.addEventListener('click', event => {
        event.preventDefault();
        startGame();
    });
    answerField.textContent = 'Game Over. ';
    answerField.appendChild(restart);
}

function showFeedback(isCorrect, guess) {
    const verdict = document.createElement('span');
    verdict.className = isCorrect ? 'correct' : 'wrong';
    verdict.textContent = isCorrect ? 'Correct! ' : 'Wrong! ';

    let text = `${current.char} reads as '${current.romaji}'`;
    if (!isCorrect) {
        text += ` not as '${guess}'`;
    }
    answerField.textContent = '';
    answerField.append(verdict, text);
}

function check(event) {
    if (event.key !== 'Enter' || !current) {
        return;
    }
    const guess = input.value.trim().toLowerCase();
    if (guess === '') {
        return;
    }

    const isCorrect = guess === current.romaji;
    showFeedback(isCorrect, guess);
    if (isCorrect) {
        correctCount++;
        pool.splice(pool.indexOf(current), 1);
    } else {
        wrongCount++;
    }

    input.value = '';
    updateCounters();
    nextTask();
}

input.addEventListener('keydown', check);
startGame();
