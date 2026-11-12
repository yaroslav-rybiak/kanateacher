const kanaField = document.getElementById('kana');
const answerField = document.getElementById('answer');
const input = document.getElementById('romaji');
const correctField = document.getElementById('correct');
const wrongField = document.getElementById('wrong');
const leftField = document.getElementById('left');
const statusField = document.getElementById('status');
const reviewField = document.getElementById('review');
const reviewList = document.getElementById('review-list');

const scriptRadios = document.querySelectorAll('input[name="script"]');

const KANA = [
    { romaji: 'a', hiragana: 'あ', katakana: 'ア' },
    { romaji: 'i', hiragana: 'い', katakana: 'イ' },
    { romaji: 'u', hiragana: 'う', katakana: 'ウ' },
    { romaji: 'e', hiragana: 'え', katakana: 'エ' },
    { romaji: 'o', hiragana: 'お', katakana: 'オ' },
    { romaji: 'ka', hiragana: 'か', katakana: 'カ' },
    { romaji: 'ki', hiragana: 'き', katakana: 'キ' },
    { romaji: 'ku', hiragana: 'く', katakana: 'ク' },
    { romaji: 'ke', hiragana: 'け', katakana: 'ケ' },
    { romaji: 'ko', hiragana: 'こ', katakana: 'コ' },
    { romaji: 'sa', hiragana: 'さ', katakana: 'サ' },
    { romaji: 'shi', hiragana: 'し', katakana: 'シ' },
    { romaji: 'su', hiragana: 'す', katakana: 'ス' },
    { romaji: 'se', hiragana: 'せ', katakana: 'セ' },
    { romaji: 'so', hiragana: 'そ', katakana: 'ソ' },
    { romaji: 'ta', hiragana: 'た', katakana: 'タ' },
    { romaji: 'chi', hiragana: 'ち', katakana: 'チ' },
    { romaji: 'tsu', hiragana: 'つ', katakana: 'ツ' },
    { romaji: 'te', hiragana: 'て', katakana: 'テ' },
    { romaji: 'to', hiragana: 'と', katakana: 'ト' },
    { romaji: 'na', hiragana: 'な', katakana: 'ナ' },
    { romaji: 'ni', hiragana: 'に', katakana: 'ニ' },
    { romaji: 'nu', hiragana: 'ぬ', katakana: 'ヌ' },
    { romaji: 'ne', hiragana: 'ね', katakana: 'ネ' },
    { romaji: 'no', hiragana: 'の', katakana: 'ノ' },
    { romaji: 'ha', hiragana: 'は', katakana: 'ハ' },
    { romaji: 'hi', hiragana: 'ひ', katakana: 'ヒ' },
    { romaji: 'fu', hiragana: 'ふ', katakana: 'フ' },
    { romaji: 'he', hiragana: 'へ', katakana: 'ヘ' },
    { romaji: 'ho', hiragana: 'ほ', katakana: 'ホ' },
    { romaji: 'ma', hiragana: 'ま', katakana: 'マ' },
    { romaji: 'mi', hiragana: 'み', katakana: 'ミ' },
    { romaji: 'mu', hiragana: 'む', katakana: 'ム' },
    { romaji: 'me', hiragana: 'め', katakana: 'メ' },
    { romaji: 'mo', hiragana: 'も', katakana: 'モ' },
    { romaji: 'ya', hiragana: 'や', katakana: 'ヤ' },
    { romaji: 'yu', hiragana: 'ゆ', katakana: 'ユ' },
    { romaji: 'yo', hiragana: 'よ', katakana: 'ヨ' },
    { romaji: 'ra', hiragana: 'ら', katakana: 'ラ' },
    { romaji: 'ri', hiragana: 'り', katakana: 'リ' },
    { romaji: 'ru', hiragana: 'る', katakana: 'ル' },
    { romaji: 're', hiragana: 'れ', katakana: 'レ' },
    { romaji: 'ro', hiragana: 'ろ', katakana: 'ロ' },
    { romaji: 'wa', hiragana: 'わ', katakana: 'ワ' },
    { romaji: 'wo', hiragana: 'を', katakana: 'ヲ' },
    { romaji: 'n', hiragana: 'ん', katakana: 'ン' },
];

let pool = [];
let current = null;
let correctCount = 0;
let wrongCount = 0;
let reviewRound = 0;
let roundMistakes = new Set(); // kana missed in the current round
let allMistakes = new Set();   // kana missed at any point this game

function selectedScripts() {
    const mode = document.querySelector('input[name="script"]:checked').value;
    return mode === 'both' ? ['hiragana', 'katakana'] : [mode];
}

function buildPool() {
    return selectedScripts().flatMap((script, scriptIndex) =>
        KANA.map((kana, i) => ({
            char: kana[script],
            romaji: kana.romaji,
            order: scriptIndex * KANA.length + i,
        }))
    );
}

function startGame() {
    pool = buildPool();
    correctCount = 0;
    wrongCount = 0;
    reviewRound = 0;
    roundMistakes = new Set();
    allMistakes = new Set();
    statusField.textContent = '';
    answerField.textContent = '';
    reviewField.hidden = true;
    kanaField.classList.remove('done');
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
        if (roundMistakes.size > 0) {
            startReviewRound();
        } else {
            finishGame();
            return;
        }
    }
    current = pool[Math.floor(Math.random() * pool.length)];
    kanaField.textContent = current.char;
}

function startReviewRound() {
    pool = [...roundMistakes];
    roundMistakes = new Set();
    reviewRound++;
    statusField.textContent = `Review round ${reviewRound}: only the kana you missed`;
    updateCounters();
}

function showReviewList() {
    reviewList.textContent = '';
    [...allMistakes]
        .sort((a, b) => a.order - b.order)
        .forEach(item => {
            const entry = document.createElement('li');
            const char = document.createElement('span');
            char.className = 'review-char';
            char.lang = 'ja';
            char.textContent = item.char;
            const romaji = document.createElement('span');
            romaji.textContent = item.romaji;
            entry.append(char, romaji);
            reviewList.appendChild(entry);
        });
    reviewField.hidden = false;
}

function finishGame() {
    current = null;
    statusField.textContent = '';
    if (allMistakes.size > 0) {
        showReviewList();
    }
    kanaField.textContent = 'Well done!';
    kanaField.classList.add('done');
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
        roundMistakes.add(current);
        allMistakes.add(current);
    }

    input.value = '';
    updateCounters();
    nextTask();
}

input.addEventListener('keydown', check);
scriptRadios.forEach(radio => radio.addEventListener('change', startGame));
startGame();
