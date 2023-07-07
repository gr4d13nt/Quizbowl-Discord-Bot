

function getUrlWithParams(url, paramArray) {
    const queryString = new URLSearchParams(paramArray).toString();
    const urlWithParams = `${url}?${queryString}`;
    return urlWithParams;
}

const url = 'https://www.qbreader.org/api/random-bonus';

async function getQuestion(paramArray) {
    const response = await fetch(getUrlWithParams(url, paramArray), {
        method: "GET",
    });
    const data = await response.json();
    const leadin = data.bonuses[0]['leadin'];
    const part1 = data.bonuses[0]['parts'][0];
    const answer1 = data.bonuses[0]['answers'][0];
    const part2 = data.bonuses[0]['parts'][1];
    const answer2 = data.bonuses[0]['answers'][1];
    const part3 = data.bonuses[0]['parts'][2];
    const answer3 = data.bonuses[0]['answers'][2];
    const formattedAnswer1 = data.bonuses[0]['formatted_answers'][0];
    const formattedAnswer2 = data.bonuses[0]['formatted_answers'][1];
    const formattedAnswer3 = data.bonuses[0]['formatted_answers'][2];
    return [leadin, part1, answer1, part2, answer2, part3, answer3, formattedAnswer1,
    formattedAnswer2, formattedAnswer3];
}

module.exports = { url, getQuestion };