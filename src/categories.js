const validCategories = ['fa', 'hist', 'lit', 'sci', 'ce', 'geo', 'myth',
'philo', 'religion', 'ss', 'trash', 'other'];

const fullCategories = ['Fine Arts','History','Literature','Science','Current Events',
'Geography','Mythology','Philosophy','Religion','Social Science','Trash','Other Academic'];

const validSubCategories = ['afa', 'ofa', 'vfa', 'amhist', 'ancienthist',
'eurohist', 'whist', 'ohist', 'amlit', 'britlit', 'classicallit', 'eurolit', 'wlit', 'olit',
'bio', 'chem', 'math', 'osci', 'physics'];

const fullSubCategories = ['Auditory Fine Arts','Other Fine Arts','Visual Fine Arts','American History',
'Ancient History','European History','World History','Other History','American Literature','British Literature',
'Classical Literature','European Literature','World Literature','Other Literature',
'Biology','Chemistry','Math','Other Science','Physics'];

const validDifficulties = ['1','2','3','4','5','6','7','8','9','10'];

// stores the parameters of the given option in array
function getParameters(words, options) {
    let arr = [];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (options.includes(word)) {
          arr.push(word);
        }
    }
    return arr;
}

// replaces abbreviations with full names
function replaceAbbreviations(abbreviations, fullNames, inputArray) {
    const resultArray = inputArray.map(item => {
        const abbreviationIndex = abbreviations.indexOf(item);
        if (abbreviationIndex !== -1) {
            return fullNames[abbreviationIndex];
        }
        return item;
    });
    return resultArray;
}

module.exports = { validCategories, fullCategories, validSubCategories, fullSubCategories, validDifficulties, getParameters, replaceAbbreviations };