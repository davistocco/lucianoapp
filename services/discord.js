import { ChannelType, Client, GatewayIntentBits } from 'discord.js';

const intents = [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]

export default class Discord {
    constructor(wpp) {
        this.wpp = wpp;
        this.client = new Client({ intents });
        this.configEvents();
    }

    login(token) {
        this.client.login(token);
    }

    configEvents() {
        this.onReady();
        this.onMessageCreate();
    }

    onMessageCreate() {
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            const phone = this.getPhoneInsideTopic(message.channel.topic);
            if (!phone) return;
            await this.wpp.sendTextMessage({ phone, message: message.content });
        });
    }

    onReady() {
        this.client.on('ready', () => {
            console.log(`Discord logged in as ${this.client.user.tag}`);
        });
    }

    async getOrCreateContactChannel({ name, phone }) {
        const guild = this.getGuildByName('WhatsApp');
        const channel = this.getGuildChannelByTopic({ guild, topic: phone });
        if (channel) return channel;
        return await guild.channels.create({ type: ChannelType.GuildText, name, topic: phone });
    }

    getPhoneInsideTopic(topic) {
        return topic;
    }

    getGuildByName(name) {
        return this.client.guilds.cache.find(guild => guild.name === name);
    }

    getGuildChannelByTopic({ guild, topic }) {
        return guild.channels.cache.find(channel => channel.topic.includes(topic));
    }

    async sendMessage({ name, phone, message }) {
        if (!message) return;
        const channel = await this.getOrCreateContactChannel({ name, phone });
        await channel.send(message);
    }
}