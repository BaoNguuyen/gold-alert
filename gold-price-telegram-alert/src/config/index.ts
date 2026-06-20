import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const config = {
    telegram: {
        botToken: requireEnv('TELEGRAM_BOT_TOKEN'),
        chatId: requireEnv('TELEGRAM_CHAT_ID'),
    },
    storage: {
        filePath: process.env['STATE_FILE'] ?? path.resolve(process.cwd(), 'data/state.json'),
        historyPath: process.env['HISTORY_FILE'] ?? path.resolve(process.cwd(), 'data/history.json'),
    },
} as const;
