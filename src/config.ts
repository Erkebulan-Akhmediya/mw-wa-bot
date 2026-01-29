import dotenv from 'dotenv';
dotenv.config(); // wa-bot variables
dotenv.config({ path: `${process.cwd()}/waha/.env/` }); // WAHA variables

export const config = {
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3002,
    WAHA_URL: process.env.WAHA_URL || 'http://localhost:3000',
    WAHA_SESSION: process.env.WAHA_SESSION || 'default',
    OMNICHANNEL_URL: process.env.OMNICHANNEL_URL || 'http://localhost:8080',
    WAHA_WEBHOOK_URL: process.env.WAHA_WEBHOOK_URL || '', // If set, will attempt to register
    WAHA_API_KEY: process.env.WAHA_API_KEY || '',
};
