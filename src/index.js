const { Client, IntentsBitField } = require('discord.js');
const { validCategories, fullCategories, validSubCategories, fullSubCategories, validDifficulties, getParameters, replaceAbbreviations } = require('./categories.js');
const { url, getQuestion } = require('./api_call.js');
require('dotenv').config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const channelData = new Map();

client.on('messageCreate', async (message) => {
    let channel = message.channel.id;
    if (!channelData.has(channel)) {
        // Create a new object to store channel-specific data
        channelData.set(channel, {
            pkActive: false,
            currBonusPart: 1,
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
    }

    if (message.content.startsWith('.a ') && data.pkActive) {
        client.channels.cache.get(channel).send(data.question[data.currBonusPart * 2] + '\n' + 'Was your answer correct? (y/n)');
        data.correctingAnswer = true;
    }

    if (message.content === 'y' && data.pkActive && data.correctingAnswer) {
        data.totalPoints += 10;
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
    }

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
    }

    if (message.content === '.skip' && data.pkActive) { }

    if (message.content === '.score' && data.pkActive) {
        if (data.currBonusPart === 1) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints) / data.bonusesHeard) / 100 + ' (' + data.totalPoints + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else if (data.currBonusPart === 2) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 10) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 10) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 20) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 20) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
    }

    if (message.content === '.end' && data.pkActive) {
        data.pkActive = false;
        data.currBonusPart = 1;
        data.question = [];
        data.cats = [];
        data.subcats = [];
        data.diffs = [];
        data.correctingAnswer = false;
        if (data.currBonusPart === 1) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints) / data.bonusesHeard) / 100 + ' (' + data.totalPoints + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else if (data.currBonusPart === 2) {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 10) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 10) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        else {
            client.channels.cache.get(channel).send('PPB: ' + Math.round(100 * (data.totalPoints - 20) / data.bonusesHeard) / 100 + ' (' + (data.totalPoints - 20) + ' points over ' + data.bonusesHeard + ' bonuses heard)');
        }
        data.totalPoints = 0;
        data.bonusesHeard = 0;
    }

    if (message.content === '.help') {
        message.reply('The valid categories are fa, hist, lit, sci, ce, geo, myth, philo, religion, ss, trash, other\n\n' +
          'The valid subcategories are afa, ofa, vfa, amhist, ancienthist, eurohist, whist, ohist, amlit, britlit, classicallit, eurolit, wlit, olit, bio, chem, math, osci, physics\n\n' +
          'The valid difficulties are 1-10\n\n' +
          'For example, if you wanted to pk American Literature 6 and 7, you would type ".pk lit amlit 6 7"\n\n' +
          'Notice that if you want to pk a certain subcategory, you must also specify the category\n\n' +
          'You can also pk multiple categories/subcategories, such as ".pk lit amlit sci bio 6"'
        );
    }

    if (message.mentions.has(client.user)) {
        // Reply to the mention
        message.reply('stfu retard');
    }
});

client.login(process.env.TOKEN);