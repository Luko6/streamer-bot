const tmi = require('tmi.js');
const opts = require('./config.json')

// Create client with out options
const client = new tmi.client(opts);

// Register our event handlers
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to twitch
client.connect();

// Called ecery time a message comes in
function onMessageHandler(target, context, msg, self){
    if (self) {return;} // Ignore own messages
    
    // Remove space from message
    const commandName = msg.trim();

    // Execute known command
    if (commandName === '!dice'){
        const num = rollDice();
        client.say(target, `You rolled a ${num}`);
        console.log(`* Executed ${commandName} command`);
    }

    if (commandName === '!help'){
        client.say(target, 'Current commands are: !help, !dice');
        console.log(`* Executed ${commandName} command`);
    }

    if (commandName === '!secret'){
        client.say(target, 'You have found the secret command!');
        console.log(`* Executed ${commandName} command`);
    }

    else{
        console.log(`* Unknown command ${commandName}`);
    }
}

rollDice = () => {
    const sides = 6;
    return Math.floor(Math.random() * sides) + 1;

}

function onConnectedHandler (addr, port){
    console.log(`* Connected to ${addr}:${port}`);
}