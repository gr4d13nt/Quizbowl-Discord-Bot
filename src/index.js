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
                client.channels.cache.get(channel).send(data.question[0] + '\n[10] ' + data.question[1]);
            }
        }
    }

    if (message.content.startsWith('.a ') && data.pkActive) {
        client.channels.cache.get(channel).send(data.question[data.currBonusPart * 2]);
        if (data.currBonusPart < 3) {
            client.channels.cache.get(channel).send('[10] ' + data.question[data.currBonusPart * 2 + 1]);
            data.currBonusPart++;
        }
        else {
            data.currBonusPart = 1;
            const paramArray = [
                ['categories', cats],
                ['subcategories', subcats],
                ['difficulties', diffs]
            ];
            data.question = await getQuestion(paramArray);
            if (!(data.question[0] === '')) {
                client.channels.cache.get(channel).send(data.question[0] + '\n[10] ' + data.question[1]);
            }
        }
    }

    if (message.content === '.end' && data.pkActive) {
        data.pkActive = false;
        data.currBonusPart = 1;
        data.question = [];
        data.cats = [];
        data.subcats = [];
        data.diffs = [];
        client.channels.cache.get(channel).send('pk ended\nPPB: 0');
    }

    if (message.mentions.has(client.user)) {
        // Reply to the mention
        message.reply('stfu retard');
    }
});

client.login(process.env.TOKEN);