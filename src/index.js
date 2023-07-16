const { Client, IntentsBitField, ActivityType } = require('discord.js');
const dataStorage = require('./dataStorage.js');
const { validCategories, fullCategories, validSubCategories, fullSubCategories, validDifficulties, getParameters, replaceAbbreviations } = require('./categories.js');
const { url, getQuestion } = require('./api_call.js');
require('dotenv').config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildPresences,
    ],
});

// stores data for each channel; allows a pk session to go on in multiple channels
const channelData = new Map();

// for storing total bonuses, total points, and total sessions for each user
const userVariables = new Map();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        activities: [{ name: `hentai`, type: ActivityType.Watching }],
        status: 'dnd',
    });
    const savedData = dataStorage.readData();
    for (const userId in savedData) {
        userVariables.set(userId, savedData[userId]);
    }
});

client.on('messageCreate', async (message) => {
    let channel = message.channel.id;
    const userId = message.author.id;

    // Retrieve user-specific variable from the map
    let userVariable = userVariables.get(userId) || {};

    if (!channelData.has(channel)) {
        // Create a new object to store channel-specific data
        channelData.set(channel, {
            pkActive: false,
            currBonusPart: 1,
            partsCorrect: 0,
            question: [],
            cats: [],
            subcats: [],
            diffs: [],
            correctingAnswer: false,
            totalPoints: 0,
            bonusesHeard: 0,
        });
    }
    const data = channelData.get(channel);

    // starts a pk if there is not one already active in the channel
    if (message.content.startsWith('.pk') && !data.pkActive) {
        const params = message.content.slice(4).split(' ');
        cats = getParameters(params, validCategories);
        subcats = getParameters(params, validSubCategories);
        diffs = getParameters(params, validDifficulties);
        cats = replaceAbbreviations(validCategories, fullCategories, cats);
        subcats = replaceAbbreviations(validSubCategories, fullSubCategories, subcats);
        const paramArray = [
            ['categories', cats],
            ['subcategories', subcats],
            ['difficulties', diffs]
        ];
        data.pkActive = true;
        if (data.currBonusPart === 1) {
            data.question = await getQuestion(paramArray);
            if (!(data.question[0] === '')) {
                client.channels.cache.get(channel).send(data.question[7] + '\n' + data.question[0] + '\n[10] ' + data.question[1]);
            }
        }

        userVariable.totalSessions = (userVariable.totalSessions || 0) + 1;
        userVariables.set(userId, userVariable);
        dataStorage.writeData({
            ...dataStorage.readData(),
            [userId]: userVariable,
        });
    }

    // .a is the command to give an answer; you will be prompted to type 'y' or 'n' to indicate whether your answer was correct
    if (message.content.startsWith('.a ') && data.pkActive) {
        client.channels.cache.get(channel).send(data.question[data.currBonusPart * 2] + '\n' + 'Was your answer correct? (y/n)');
        data.correctingAnswer = true;
    }

    // if the given answer is correct, add 10 to total score and send the next part
    if (message.content === 'y' && data.pkActive && data.correctingAnswer) {
        data.totalPoints += 10;
        data.partsCorrect++;
        data.correctingAnswer = false;
        if (data.currBonusPart < 3) {
            // sends next part of bonus
            client.channels.cache.get(channel).send('[10] ' + data.question[data.currBonusPart * 2 + 1]);
            data.currBonusPart++;
        }
        // there is no next part
        else {
            data.bonusesHeard++;
            data.currBonusPart = 1;
            data.partsCorrect = 0;
            const paramArray = [
                ['categories', cats],
                ['subcategories', subcats],
                ['difficulties', diffs]
            ];
            data.question = await getQuestion(paramArray);
            if (!(data.question[0] === '')) {
                client.channels.cache.get(channel).send(data.question[7] + '\n' + data.question[0] + '\n[10] ' + data.question[1]);
            }
            userVariable.globalBonuses = (userVariable.globalBonuses || 0) + 1;
        }
        userVariable.globalPoints = (userVariable.globalPoints || 0) + 10;
        userVariables.set(userId, userVariable);
        dataStorage.writeData({
            ...dataStorage.readData(),
            [userId]: userVariable,
        });
    }

    // if the given answer is incorrect, send the next part without adding to the score
    if (message.content === 'n' && data.pkActive && data.correctingAnswer) {
        data.correctingAnswer = false;

        message.reply('literal garbage. you should kill yourself NOW!!!!!');

        if (data.currBonusPart < 3) {
            // sends next part of bonus
            client.channels.cache.get(channel).send('[10] ' + data.question[data.currBonusPart * 2 + 1]);
            data.currBonusPart++;
        }
        // there is no next part
        else {
            data.bonusesHeard++;
            data.currBonusPart = 1;
            data.partsCorrect = 0;
            const paramArray = [
                ['categories', cats],
                ['subcategories', subcats],
                ['difficulties', diffs]
            ];
            data.question = await getQuestion(paramArray);
            if (!(data.question[0] === '')) {
                client.channels.cache.get(channel).send(data.question[7] + '\n' + data.question[0] + '\n[10] ' + data.question[1]);
            }
            userVariable.globalBonuses = (userVariable.globalBonuses || 0) + 1;
        }
        userVariables.set(userId, userVariable);
        dataStorage.writeData({
            ...dataStorage.readData(),
            [userId]: userVariable,
        });
    }

    // skip the current bonus (and doesn't count points earned from it) and call getQuestion again to get a new bonus
    if (message.content === '.skip' && data.pkActive) {
        if (data.partsCorrect === 1) {
            data.totalPoints -= 10;
        }
        else if (data.partsCorrect === 2) {
            data.totalPoints -= 20;
        }
        data.currBonusPart = 1;
        data.partsCorrect = 0;
        data.question = [];
        data.correctingAnswer = false;
        const paramArray = [
            ['categories', cats],
            ['subcategories', subcats],
            ['difficulties', diffs]
        ];
        data.question = await getQuestion(paramArray);
        if (!(data.question[0] === '')) {
            client.channels.cache.get(channel).send(data.question[7] + '\n' + data.question[0] + '\n[10] ' + data.question[1]);
        }
    }

    // sends a message with points per bonus, total points, and bonuses heard (-10 and -20 are to account for the fact that it doesn't factor in the current bonus)
    if (message.content === '.score' && data.pkActive) {
        if (data.partsCorrect === 1) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 10) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 10) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else if (data.partsCorrect === 2) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 20) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 20) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints) / data.bonusesHeard) / 100 + ' (' + data.totalPoints + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
    }

    // end the pk session, showing your ppb (points per bonus), total points, and bonuses heard (same thing as .score)
    if (message.content === '.end' && data.pkActive) {
        data.pkActive = false;
        data.currBonusPart = 1;
        data.question = [];
        data.cats = [];
        data.subcats = [];
        data.diffs = [];
        data.correctingAnswer = false;
        if (data.partsCorrect === 1) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 10) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 10) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else if (data.partsCorrect === 2) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 20) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 20) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints) / data.bonusesHeard) / 100 + ' (' + data.totalPoints + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        data.totalPoints = 0;
        data.bonusesHeard = 0;
        data.partsCorrect = 0;
    }

    if (message.content === '.stats') {
        const userVariable = userVariables.get(userId);
        if (userVariable) {
            message.reply('You have scored **' + userVariable.globalPoints + '** points in **' + userVariable.globalBonuses + '** bonuses over **' + userVariable.totalSessions + '** pk sessions');
        }
        else {
            message.reply('kill yourself');
        }
    }

    if (message.content.startsWith('.stats ')) {
        const mentionedUser = message.mentions.users.first();
        if (mentionedUser) {
            const userVariable = userVariables.get(mentionedUser.id);
            if (userVariable) {
                message.reply(mentionedUser.username + ' has scored **' + userVariable.globalPoints + '** points in **' + userVariable.globalBonuses + '** bonuses over **' + userVariable.totalSessions + '** pk sessions');
            }
            else {
                message.reply('kill yourself');
            }
        }
    }

    if (message.content === '.help') {
        message.reply('The valid categories are fa, hist, lit, sci, ce, geo, myth, philo, religion, ss, trash, other\n\n' +
            'The valid subcategories are afa, ofa, vfa, amhist, ancienthist, eurohist, whist, ohist, amlit, britlit, classicallit, eurolit, wlit, olit, bio, chem, math, osci, physics\n\n' +
            'The valid difficulties are 1-10\n\n' +
            'For example, if you wanted to pk American Literature 6 and 7, you would type ".pk amlit 6 7"\n\n' +
            'You can also pk multiple categories/subcategories, such as ".pk amlit bio 6"\n\n' +
            'To give an answer, type ".a " followed by your answer. Messages without ".a " will be ignored by the bot\n\n' +
            'If you want to see your score, type ".score"\n\n' +
            'If you want to skip a bonus, type ".skip"\n\n' +
            'If you want to end the pk session, type ".end"');
    }

    // trolling
    if (message.mentions.has(client.user)) {
        message.reply('You gonna stay on my dick until you die. You serve no purpose in life. Your purpose in life is to be on my stream sucking on my dick daily. Your purpose in life is to be in that chat blowing the dick daily. Your life is nothing, you serve zero purpose. You should kill yourself, NOW.');
    }

    // even more trolling
    if (message.content === 'kys') {
        message.delete()
        client.channels.cache.get(channel).send('https://tenor.com/bPEo1.gif')
    }
});

client.login(process.env.TOKEN);