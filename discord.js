// Import required packages
const Discord = require("discord.js");
const fetch = require("node-fetch");
const tmi = require("tmi.js");

// Import configuration constants/variables
var { prefix, moderator, filtered_words, greeting_channel,
     member_role, stream_alert_channel} = require("./config.json");
const { token, opts, stream_id } = require('./config.json');
const embeds = require('./embeds.json');

// Creating the Discord client for the bot
const bot = new Discord.Client();

// Creating the Twitch client for the bot
const twitch_client = new tmi.client(opts);

// making a new set from the list of filtered words
filtered_words = new Set(filtered_words)

// If bot is ready and running it logs on console
bot.on('ready', () => {
    console.log('bot is ready');
})

// If a new member joins add role to him
bot.on("guildMemberAdd", member => {
    member.roles.add(member_role);
    bot.channels.cache.get(greeting_channel).send(`Üdvözöllek ${member.displayName} érezd jól magad a szerveren!`);
})

// Execute on every mesasge
bot.on('message', async (msg) => {
    // Execute word filter on every message
    word_filter(msg, filtered_words);

    // If the message doesn't contain the prefix or the bot sent it won't register
    if(!msg.content.startsWith(prefix) || msg.author.bot) {
        console.log('no prefix');
        return;
    }

    // Splitting the message by whitespace and taking the first string out as the command
    // const args = msg.content.slice(prefix.length).trim().split(' ');
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Console logging the command and arguments
    console.log('command: ', command);
    console.log(args);
    
    // Check for the command, and execute it.
    switch (command){
        // User commands
        case 'help':
            help(msg);
            break;
        case 'ego':
            ego(msg);
            break;
        case 'ping':
            ping(msg);
            break;
        case 'joke':
            joke(msg);
            break;
        case 'roll':
            roll(msg, args);
            break;

        // Moderator only commands
        case 'kick':
            kick(msg);
            break;
        case 'clear':
            clear_messages(msg, args);
            break;
        case 'emoji':
            emoji(msg, args);
            break;
        case 'prefix':
            set_prefix(msg, args);
            break;
        case 'test':
            test(msg, args);
            break;
    }
})

/*-----------------------------------------------------------------
------------------USER FUNCTION DEFINITIONS START------------------
-----------------------------------------------------------------*/

/*
Sends a message after its call
*/
help = (msg) => {
    if(msg.member.roles.cache.has(moderator)) {
        msg.channel.send({ embed: embeds.help_mod });
        return
    }

    msg.channel.send({ embed: embeds.help })
}

test = (msg, args) => {
    msg.channel.send({ embed: embeds.stream_on });
    //bot.channels.cache.get(stream_alert_channel)
    //    .send({ embed: embeds.stream_on });
    const qUrl = "https://decapi.me/twitch/uptime/luko6_"

    fetch(qUrl)
        .then(response => response.json())
        .then(data => console.log(data));
}

ping = (msg) => {
    msg.channel.send('Pong!');
}


/* 
Reacts to message and replies to messager
*/
ego = (msg) => {
    msg.react("😽")
    msg.reply("Wow, what a great post!");
}


/*
Console logs emoji in the argument
Bot developer command 
*/
emoji = (args) => {
    if(!msg.member.roles.cache.has(moderator)) {
        msg.reply('You are not worthy!');
        return
    }
    if(args[0]){
        let emoji = args[0];
        console.log(emoji);
    }
}


/*
Deletes the previous N messages in the text channel it is called from,
and sends a message about it.
N = 2 on default, and can be set as an argument
*/
clear_messages = (msg, args) => {
    // Checks if user is a moderator
    if(!msg.member.roles.cache.has(moderator)) {
        msg.reply('You are not worthy!');
        return
    }

    let num = 2;

    if(args[0]){
        num = parseInt(args[0])+1;
    }

    msg.channel.bulkDelete(num);
    msg.channel.send(`Deleted ${args[0]} posts for you`);
}


/*
Requesting a joke from an API, and replying with the joke to the sender
*/
joke = async (msg) => {
    let getJoke = async () => {
        let result = await fetch('https://official-joke-api.appspot.com/random_joke');
        let json = await result.json();
        return json;
    }

    let joke = await getJoke();

    msg.reply(`Here is your joke\n\n${joke.setup}\n\n${joke.punchline}`)
}


/*
Kicks mentioned user
*/
kick = (msg) => {
    // Check for moderator role
    if(!msg.member.roles.cache.has(moderator)) {
        msg.reply('You are not worthy!');
        return
    }

    // Get the first mentioned user.
    const user = msg.mentions.users.first();

    if(!user){
        msg.reply('No user mentioned')
    }

    const member = msg.guild.member(user);

    if(member){
        member.kick('this is a message for the server logs').then(() =>{
            msg.reply(`${user.tag} was kicked from the server`)
        })
    }
}


/*
Rolls a N sided dice
N defaults to 6
*/
roll = (msg, args) => {
    let num = 6;

    if(args[0] && args[0] > 2){
        num = parseInt(args[0]);
    }
    if(args[0] && args[0] < 2){
        msg.reply(`number must be above 2`);
        return;
    }

    let roll = Math.floor(Math.random() * num) + 1;
    msg.reply(`you have rolled ${roll}`);
}


/*
Sets the prefix to the selected one
# ADD FEATURE TO SAVE IT TO THE CONFIG.JSON
*/
set_prefix = (msg, args) => {
    if(args[0]){
        prefix = args[0];
        prefix.key = args[0];

        msg.channel.send(`Prefix was set to: ${prefix}`);
    }

    else{
        msg.channel.send(`The current prefix is: ${prefix}`)
    }
}

/* ----------------------------------------------------------------
-------------------USER FUNCTION DEFINITIONS END-------------------
-------------------------------------------------------------------
----------------------RUNTIME FUNCTIONS START----------------------
---------------------------------------------------------------- */

/* 
Deletes messages containing specified words
# ADD FEATURE TO SAVE THE LIST IN THE CONFIG.JSON
*/
word_filter = (msg, filtered_words) => {
    if(msg.author.bot){
        return
    }

    let wordArray = msg.content.split(' ');
    console.log(wordArray);

    for(var i = 0; i < wordArray.length; i++){
        if(filtered_words.has(wordArray[i])){
            msg.delete();
            msg.channel.send(`Sorry ${msg.author.username}, you are an incel!`); // # ezt javítsd már át mielőtt publikálod :Ddd
            break;
        }
    }
}

/*-----------------------------------------------------------------
-----------------------RUNTIME FUNCTIONS END-----------------------
---------------------------------------------------------------- */


// Start the bot
bot.login(token);