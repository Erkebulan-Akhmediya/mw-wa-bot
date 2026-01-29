import axios from 'axios';
import { config } from './config';

export class WahaClient {
    private readonly baseUrl: string;
    private readonly session: string;
    private readonly headers: any;

    constructor() {
        this.baseUrl = config.WAHA_URL;
        this.session = config.WAHA_SESSION;
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Api-Key': `${config.WAHA_API_KEY}`,
        }
    }

    async sendMessage(chatId: string, text: string) {
        console.log(`[WAHA] Sending message to ${chatId}: ${text}`);
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/sendText`,
                {
                    session: this.session,
                    chatId,
                    text,
                },
                { headers: this.headers }
            );
            return response.data;
        } catch (error: any) {
            console.error('[WAHA] Failed to send message:', error.response?.data || error.message);
            throw error;
        }
    }

    // Optional: Auto-register webhook
    async setWebhook(url: string) {
        console.log(`[WAHA] Registering webhook: ${url}`);
        try {
            // WAHA structure for setting webhook might vary by version, checking docs or assuming standard endpoint
            // Based on known WAHA API: POST /api/{session}/webhook
            // { url: "..." }
            await axios.post(
                `${this.baseUrl}/api/${this.session}/webhook`,
                { url },
                { headers: this.headers }
            );
            console.log('[WAHA] Webhook registered successfully');
        } catch (error: any) {
            console.error('[WAHA] Failed to register webhook:', error.response?.data || error.message);
        }
    }
}
