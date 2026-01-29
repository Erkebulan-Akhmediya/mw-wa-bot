import express from 'express';
import axios from 'axios';
import { config } from './config';
import { WahaClient } from './client';

export const app = express();
app.use(express.json());

const wahaClient = new WahaClient();

import { Request, Response } from 'express';

// Receive Webhook from WAHA
app.post('/webhook', async (req: Request, res: Response) => {
    // WAHA payload structure checks
    const payload = req.body;

    // WAHA sends various events. We are interested in 'message'.
    // Example payload: { event: "message", payload: { ... } }
    // Or sometimes it's direct.
    // Let's log to see.
    // Assuming standard WAHA (devlike.pro) structure:
    // { event: 'message', payload: { id:..., from:..., body:..., ... } }

    if (payload.event === 'message' || payload.event === 'message.any') { // Check specific event types
        const msg = payload.payload || payload; // handle potential variations

        // Skip messages sent by me (if WAHA echos them)
        if (msg.fromMe) {
            return res.status(200).send('OK');
        }

        const chatId = msg.from;
        const text = msg.body;
        const pushName = msg._data?.notifyName || msg.pushName || 'WhatsApp User';

        console.log(`📩 [WhatsApp] Received from ${pushName} (${chatId}): ${text}`);

        try {
            // Forward to OMS
            // We match the structure expected by OMS based on our finding in methods/webhooks/routes.ts
            // OMS generic route does: payload.from = payload.raw.chat.id
            // So we need to structure our payload to result in that or compatible.

            // To make it easy for OMS generic handler:
            // Generic handler expects `provider` param.

            // The OMS handler does:
            // const { provider } = request.params;
            // payload.from = payload.raw.chat.id;

            // So we send:
            /*
              {
                chatId: chatId, // helpful top level
                text: text,
                username: pushName,
                raw: {
                  chat: {
                      id: chatId
                  },
                  // ... other raw data if needed
                  original: msg
                }
              }
            */

            await axios.post(`${config.OMNICHANNEL_URL}/webhooks/whatsapp`, {
                chatId,
                text,
                username: pushName,
                raw: {
                    chat: {
                        id: chatId
                    },
                    ...msg
                }
            });

        } catch (error) {
            console.error('❌ [WhatsApp] Failed to forward to OMS:', error);
        }
    }

    res.status(200).send('OK');
});

// Send message (Bridge from OMS)
app.post('/send', async (req: Request, res: Response) => {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
        return res.status(400).json({ error: 'Missing chatId as to or text' });
    }

    try {
        await wahaClient.sendMessage(chatId, text);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send message via WAHA' });
    }
});

export const startServer = () => {
    app.listen(config.PORT, async () => {
        console.log(`🚀 WA-Bot running on port ${config.PORT}`);

        if (config.WAHA_WEBHOOK_URL) {
            await wahaClient.setWebhook(config.WAHA_WEBHOOK_URL);
        }
    });
};
