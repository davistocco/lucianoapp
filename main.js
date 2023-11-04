import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Discord from './services/discord.js'
import Wpp from './services/wpp.js';

const wpp = new Wpp({
    baseURL: process.env.ZAPI_BASE_URL,
    token: process.env.ZAPI_CLIENT_TOKEN
});
const discord = new Discord(wpp);
discord.login(process.env.DISCORD_TOKEN);

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 3000;

app.get('/', (req, res) => {
    res.status(200).send();
});

app.post('/hook/on-message-received', async (req, res) => {
    const { chatName, phone, text, isGroup } = req.body;
    if (isGroup) res.status(500).json({ error: 'Not implemented yet' });
    await discord.sendMessage({ name: chatName, phone, message: text?.message });
    res.status(200).send();
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})