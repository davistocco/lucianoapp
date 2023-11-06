import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Discord from './services/discord.js'
import Wpp from './services/wpp.js';
import _ from 'lodash';

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

// TODO: refactor this endpoint by creating dedicated classes
app.post('/hook/on-message-received', async (req, res) => {
    try {
        await handleMessage(req);
        return res.status(200).send();
    } catch (e) {
        return res.status(500).json(e);
    }
})

async function handleMessage(req) {
    const body = onMessageReceivedRequestBody(req);
    if (body.isGroup) throw new Error('Groups not implemented yet');
    await discord.sendMessage({
        name: body.chatName,
        phone: body.phone,
        text: body.text,
        image: body.image
    });
}

function onMessageReceivedRequestBody(req) {
    return _.pick(req.body, ['isGroup', 'chatName', 'phone', 'text', 'image']);
}

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})