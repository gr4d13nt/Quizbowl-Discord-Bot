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
    const qdata = await response.json();
    const leadin = qdata.bonuses[0]['leadin'];
    const part1 = qdata.bonuses[0]['parts'][0];
    const answer1 = qdata.bonuses[0]['answers'][0];
    const part2 = qdata.bonuses[0]['parts'][1];
    const answer2 = qdata.bonuses[0]['answers'][1];
    const part3 = qdata.bonuses[0]['parts'][2];
    const answer3 = qdata.bonuses[0]['answers'][2];
    // const formattedAnswer1 = qdata.bonuses[0]['formatted_answers'][0];
    // const formattedAnswer2 = qdata.bonuses[0]['formatted_answers'][1];
    // const formattedAnswer3 = qdata.bonuses[0]['formatted_answers'][2];
    return [leadin, part1, answer1, part2, answer2, part3, answer3];
}

module.exports = { url, getQuestion };