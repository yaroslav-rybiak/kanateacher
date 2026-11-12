// Kana word -> romaji. A word is split into units (one kana, or a combination
// like きゃ or っか); each unit has a list of accepted spellings, the first of
// which is the one shown as the answer.

const ROMAJI_UNITS = {
    'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],
    'か': ['ka'], 'き': ['ki'], 'く': ['ku'], 'け': ['ke'], 'こ': ['ko'],
    'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
    'さ': ['sa'], 'し': ['shi', 'si'], 'す': ['su'], 'せ': ['se'], 'そ': ['so'],
    'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
    'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
    'だ': ['da'], 'ぢ': ['ji', 'di', 'zi'], 'づ': ['zu', 'du'], 'で': ['de'], 'ど': ['do'],
    'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
    'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
    'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
    'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
    'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
    'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
    'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
    'わ': ['wa'], 'を': ['wo', 'o'],
    // Loanword combinations (katakana is converted to hiragana before lookup).
    'てぃ': ['ti'], 'でぃ': ['di'], 'でゅ': ['dyu'],
    'ふぁ': ['fa'], 'ふぃ': ['fi'], 'ふぇ': ['fe'], 'ふぉ': ['fo'],
    'うぃ': ['wi'], 'うぇ': ['we'], 'うぉ': ['wo'],
    'しぇ': ['she', 'sye'], 'じぇ': ['je', 'zye'], 'ちぇ': ['che', 'tye'],
};

// きゃ, しゅ, ちょ ... : consonant part + vowel of the small kana.
const YOON_CONSONANTS = {
    'き': ['ky'], 'ぎ': ['gy'], 'し': ['sh', 'sy'], 'じ': ['j', 'jy', 'zy'],
    'ち': ['ch', 'ty'], 'に': ['ny'], 'ひ': ['hy'], 'び': ['by'], 'ぴ': ['py'],
    'み': ['my'], 'り': ['ry'],
};
const YOON_VOWELS = { 'ゃ': 'a', 'ゅ': 'u', 'ょ': 'o' };

Object.keys(YOON_CONSONANTS).forEach(kana => {
    Object.keys(YOON_VOWELS).forEach(small => {
        ROMAJI_UNITS[kana + small] = YOON_CONSONANTS[kana].map(c => c + YOON_VOWELS[small]);
    });
});

const HIRAGANA_RE = /^[ぁ-ゖ]+$/;
const KATAKANA_RE = /^[ァ-ヶー]+$/;

// 'hiragana', 'katakana', or null for anything mixed or non-kana.
function scriptOf(word) {
    if (HIRAGANA_RE.test(word)) {
        return 'hiragana';
    }
    if (KATAKANA_RE.test(word)) {
        return 'katakana';
    }
    return null;
}

function toHiragana(word) {
    return word.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

// Splits a word into [{ alts: [...accepted spellings], display: shown spelling }].
function tokenize(word) {
    const kana = toHiragana(word);
    const units = [];
    let i = 0;

    const readPlain = () => {
        const pair = kana.slice(i, i + 2);
        const key = ROMAJI_UNITS[pair] ? pair : kana[i];
        if (!ROMAJI_UNITS[key]) {
            throw new Error(`Cannot romanise '${kana[i]}' in '${word}'`);
        }
        i += key.length;
        return ROMAJI_UNITS[key];
    };

    while (i < kana.length) {
        const ch = kana[i];
        let alts;
        let display;

        if (ch === 'ん') {
            i++;
            alts = ['n', 'nn', "n'"];
            // Hepburn writes n' before a vowel or y (ほんや = hon'ya).
            display = 'あいうえおやゆよ'.includes(kana[i] || ' ') ? "n'" : 'n';
        } else if (ch === 'っ') {
            i++;
            // Small tsu doubles the next consonant; っち is tchi in Hepburn.
            alts = readPlain().flatMap(alt =>
                alt.startsWith('ch') ? ['t' + alt, 'c' + alt] : [alt[0] + alt]
            );
        } else if (ch === 'ー') {
            i++;
            const previous = units[units.length - 1].display;
            alts = [previous[previous.length - 1], '-'];
        } else {
            alts = readPlain();
        }
        units.push({ alts, display: display || alts[0] });
    }
    return units;
}

// The spelling shown as the correct answer, e.g. がっこう -> gakkou.
function toRomaji(word) {
    return tokenize(word).map(unit => unit.display).join('');
}

// True if `guess` is any accepted spelling of `word`.
function matchesRomaji(word, guess) {
    const units = tokenize(word);
    const match = (unitIndex, position) => {
        if (unitIndex === units.length) {
            return position === guess.length;
        }
        return units[unitIndex].alts.some(alt =>
            guess.startsWith(alt, position) && match(unitIndex + 1, position + alt.length)
        );
    };
    return match(0, 0);
}

if (typeof module !== 'undefined') {
    module.exports = { scriptOf, tokenize, toRomaji, matchesRomaji };
}
