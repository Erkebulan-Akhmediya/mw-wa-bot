import request from 'supertest';
import { app } from './server';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('wa-bot server', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /webhook', () => {
        it('should forward incoming messages to OMS', async () => {
            mockedAxios.post.mockResolvedValue({ data: { success: true } });

            const payload = {
                event: 'message',
                payload: {
                    from: '123456789@c.us',
                    body: 'Hello World',
                    pushName: 'Test User',
                    _data: { notifyName: 'Test User' }
                }
            };

            const res = await request(app)
                .post('/webhook')
                .send(payload);

            expect(res.status).toBe(200);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/webhooks/whatsapp'),
                expect.objectContaining({
                    chatId: '123456789@c.us',
                    text: 'Hello World',
                    username: 'Test User'
                })
            );
        });

        it('should ignore messages from me', async () => {
            const payload = {
                event: 'message',
                payload: {
                    fromMe: true,
                    from: '123456789@c.us',
                    body: 'My own message'
                }
            };

            const res = await request(app)
                .post('/webhook')
                .send(payload);

            expect(res.status).toBe(200);
            expect(mockedAxios.post).not.toHaveBeenCalled();
        });
    });

    describe('POST /send', () => {
        it('should send message via WAHA', async () => {
            mockedAxios.post.mockResolvedValue({ data: { success: true } });

            const payload = {
                chatId: '123456789@c.us',
                text: 'Hello back'
            };

            const res = await request(app)
                .post('/send')
                .send(payload);

            expect(res.status).toBe(200);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/sendText'),
                expect.objectContaining({
                    chatId: '123456789@c.us',
                    text: 'Hello back'
                })
            );
        });

        it('should return 400 if missing fields', async () => {
            const payload = {
                text: 'Hello back'
            };

            const res = await request(app)
                .post('/send')
                .send(payload);

            expect(res.status).toBe(400);
        });
    });
});
