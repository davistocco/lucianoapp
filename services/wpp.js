import axios from 'axios';

export default class Wpp {
    constructor({ baseURL, token }) {
        this.api = axios.create({
            baseURL, headers: { 'Client-Token': token }
        });
    }

    async sendTextMessage({ phone, message }) {
        try {
            await this.api.post('/send-text', { phone, message });
        } catch (e) {
            console.log(e.response.data);
        }
    }

    async sendImage({ phone, caption, image }) {
        try {
            await this.api.post('/send-image', { phone, caption, image });
        } catch (e) {
            console.log(e.response.data);
        }
    }
}