const { Client, IntentsBitField } = require('discord.js');
const { validCategories, fullCategories, validSubCategories, fullSubCategories, validDifficulties, getParameters, replaceAbbreviations } = require('./categories.js');
const { url, getQuestion } = require('./api_call.js');

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

let pkActive = false;
let currBonusPart = 1;
let question = [];

client.on('messageCreate', async (message) => {
    let channel = message.channel.id;
    if (message.content.startsWith('.pk')) {
        const params = message.content.slice(4).split(' ');
        let cats = getParameters(params, validCategories);
        let subcats = getParameters(params, validSubCategories);
        let diffs = getParameters(params, validDifficulties);
        cats = replaceAbbreviations(validCategories, fullCategories, cats);
        subcats = replaceAbbreviations(validSubCategories, fullSubCategories, subcats);
        const paramArray = [
            ['categories', cats],
            ['subcategories', subcats],
            ['difficulties', diffs]
        ];
        if (currBonusPart === 1) {
            question = await getQuestion(paramArray);
            client.channels.cache.get(channel).send(question[0] + '\n[10] ' + question[1]);
        }
    }

    if (message.content.startsWith('.a ')) {
        client.channels.cache.get(channel).send(question[currBonusPart*2]);
        if (currBonusPart < 3) {
            client.channels.cache.get(channel).send('[10] ' + question[currBonusPart*2+1]);
            currBonusPart++;
        }
        else {
            currBonusPart = 1;
        }
    }
});

client.login("MTEyNjk1MzE1NzAzODE5ODc5NA.GQG6mf.BpNYKrM5zG_nPc0OjtM7-v1LgkpTB0R0A1luh8");