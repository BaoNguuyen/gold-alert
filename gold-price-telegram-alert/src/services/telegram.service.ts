import axios from 'axios';
import { config } from '../config';
import { AlertPayload } from '../types';
import { logger } from '../utils/logger';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

function formatPrice(price: number): string {
    return price.toLocaleString('vi-VN');
}

function buildMessage(payload: AlertPayload): string {
    const { currentPrice, previousPrice, percentChange, direction } = payload;
    const directionIcon = direction === 'UP' ? '📈' : '📉';
    const sign = direction === 'UP' ? '+' : '-';
    const time = new Date(currentPrice.fetchedAt).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
    });

    return [
        `🚨 *GOLD ALERT*`,
        ``,
        `*Current Price:* ${formatPrice(currentPrice.price)} ${currentPrice.unit}`,
        `*Previous Price:* ${formatPrice(previousPrice.price)} ${previousPrice.unit}`,
        `*Change:* ${sign}${Math.abs(percentChange).toFixed(2)}%`,
        `*Direction:* ${directionIcon} ${direction}`,
        `*Time:* ${time}`,
        ``,
        `_Source: ${currentPrice.source}_`,
    ].join('\n');
}

export async function sendTelegramAlert(payload: AlertPayload): Promise<void> {
    const { botToken, chatId } = config.telegram;
    const message = buildMessage(payload);

    const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        });
        logger.info('Telegram alert sent successfully.');
    } catch (err) {
        if (axios.isAxiosError(err)) {
            logger.error(
                'Failed to send Telegram alert.',
                err.response?.data ?? err.message,
            );
        } else {
            logger.error('Failed to send Telegram alert.', err);
        }
        throw err;
    }
}

export async function sendTelegramPhoto(photoUrl: string, caption: string): Promise<void> {
    const { botToken, chatId } = config.telegram;
    const url = `${TELEGRAM_API_BASE}/bot${botToken}/sendPhoto`;

    try {
        await axios.post(url, {
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: 'Markdown',
        });
        logger.info('Telegram photo report sent successfully.');
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const data = err.response?.data;
            logger.error(
                `Failed to send Telegram photo. HTTP ${err.response?.status ?? 'N/A'} – ${data?.description ?? err.message}`,
            );
        } else {
            logger.error('Failed to send Telegram photo.', err);
        }
    }
}
