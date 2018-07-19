let kanaField = document.getElementById("kana");
let answerField = document.getElementById("answer");
let input = document.getElementById("romaji");
let correctField = document.getElementById("correct");
let wrongField = document.getElementById("wrong");
let leftField = document.getElementById("left");
let correctCount = wrongCount = 0;
let question, answer;
let kanaDict = {
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

function createTask() {
    leftField.innerHTML = Object.keys(kanaDict).length.toString();
    let randomValue = Math.floor(Math.random()*Object.keys(kanaDict).length);
    answer = Object.keys(kanaDict)[randomValue];
    question = kanaDict[answer];
    kanaField.innerHTML = question;
    return answer;
}

function check() {
    if(event.key === 'Enter') {
        let suggest = input.value.replace(/<(?:.|\n)*?>/gm, '');

        if (suggest === answer) {
            answerField.innerHTML = '<span class="correct">Correct! </span>' + kanaDict[answer] + ' reads as \'' + answer + '\'';
            correctCount++;
            correctField.innerHTML = correctCount.toString();
            delete kanaDict[answer];

        } else {
            answerField.innerHTML = '<span class="wrong">Wrong! </span>' + kanaDict[answer] + ' reads as \'' + answer + '\' not as \'' + suggest + '\'';
            wrongCount++;
            wrongField.innerHTML = wrongCount.toString();
        }

        if (Object.keys(kanaDict).length > 0) {
            answer = createTask();
            question = kanaDict[answer];
            input.value = '';

        }  else {
            leftField.innerHTML = Object.keys(kanaDict).length.toString();
            answerField.innerHTML = 'Game Over. <a href="javascript:location.reload()">Start again</a>';
            kanaField.innerHTML = 'Well done!';
            input.value = '';
        }
    }
}