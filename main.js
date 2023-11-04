import 'dotenv/config'
import { ChannelType, Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('ready', () => {
    console.log(`Discord logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const channel = message.channel;
    const contactPhone = getPhoneInsideTopic(channel.topic);
    if (!contactPhone) return;
    await sendWppTextMessage({ phone: contactPhone, message: message.content });
})

function getPhoneInsideTopic(topic) {
    return topic;
}

client.login(process.env.DISCORD_TOKEN);

async function upsertContactChannel({ name, phone }) {
    const guild = getGuildByName('WhatsApp');
    const channel = getGuildChannelByTopic({ guild, topic: phone });
    if (channel) return channel;
    return await guild.channels.create({ type: ChannelType.GuildText, name, topic: phone });
}

function getGuildByName(name) {
    return client.guilds.cache.find(guild => guild.name === name);
}

function getGuildChannelByTopic({ guild, topic }) {
    return guild.channels.cache.find(channel => channel.topic.includes(topic));
}

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = 3000;

app.get('/', (req, res) => {
    res.status(200).send();
});

app.post('/hook/on-message-received', async (req, res) => {
    const { chatName, phone, text, isGroup } = req.body;
    if (isGroup) res.status(500).json({ error: 'Not implemented yet' });
    const channel = await upsertContactChannel({ name: chatName, phone });
    await sendMessage({ channel, message: text?.message });
    res.status(200).send();
})

async function sendMessage({ channel, message }) {
    if (!message) return;
    await channel.send(message);
}

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})

async function sendWppTextMessage({ phone, message }) {
    try {
        await wppApi.post('/send-text', { phone, message });
    } catch (e) {
        console.log(e.response.data);
    }
}

const wppApi = axios.create({
    baseURL: process.env.ZAPI_BASE_URL,
    headers: {
        'Client-Token': process.env.ZAPI_CLIENT_TOKEN
    }
})