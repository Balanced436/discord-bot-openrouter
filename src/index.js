require('dotenv').config();
import { Client, GatewayIntentBits } from 'discord.js';
const OPEN_ROUTER_API_KEY = "enter you api key $$$"
const MODEL = "google/gemini-2.0-flash-001"

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ]
});

client.once('ready', () => {
    console.log(`${client.user.tag}`);
});

client.on('messageCreate', message => {
    // Affiche le nom d'utilisateur et le contenu du message
    console.log(`Message de ${message.author.username}: ${message.content}`);
    if (message.author.bot) return;

    // call external service
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${OPEN_ROUTER_API_KEY}`);

    const raw = JSON.stringify({
        "model": `${MODEL}`,
        "messages": [
            {
            "role": "user",
            "content": `${message.content}`
            }
        ]
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("https://openrouter.ai/api/v1/chat/completions", requestOptions)
    .then(async (response) => {
        if (response.ok) {
            return await response.json();
        } else {
            throw error("there is problem with open router api");
        }
    })
    .then(async (result) => {
        const replyContent = result.choices[0].message.content;
        const chunks = replyContent.match(/.{1,4000}/g);

        for (const chunk of chunks) {
            await message.channel.send(`${chunk}`);
        }
    })
    .catch((error) => console.error(error));
});

client.login(process.env.TOKEN);