import { fetchGoldPrice } from '../services/goldPrice.service';
import { sendTelegramAlert } from '../services/telegram.service';
import { loadState, saveState, loadHistory, saveHistory } from '../services/storage.service';
import { logger } from '../utils/logger';
import { AlertDirection, AlertPayload } from '../types';

function calcPercentChange(current: number, previous: number): number {
    return ((current - previous) / previous) * 100;
}

function appendHistory(price: number, timestamp: string): void {
    const history = loadHistory();
    const lastPoint = history[history.length - 1];

    if (!lastPoint) {
        history.push({ timestamp, price });
        saveHistory(history);
        return;
    }

    const lastTimeMs = new Date(lastPoint.timestamp).getTime();
    const currentTimeMs = new Date(timestamp).getTime();
    const ONE_HOUR = 60 * 60 * 1000;

    // Lưu mỗi ~1 tiếng (cho phép bù jitter 5 phút)
    if (currentTimeMs - lastTimeMs >= ONE_HOUR - 5 * 60 * 1000) {
        history.push({ timestamp, price });
        saveHistory(history);
    }
}

/**
 * Chạy một lần: fetch giá vàng, so sánh với giá cũ, gửi Telegram nếu có thay đổi.
 * Được gọi bởi GitHub Actions theo lịch (cron schedule).
 */
export async function monitorGoldPrice(): Promise<void> {
    logger.info('─── Monitor: bắt đầu ───');

    // 1. Load state
    const state = loadState();

    // 2. Fetch giá hiện tại
    let currentPrice;
    try {
        currentPrice = await fetchGoldPrice();
        appendHistory(currentPrice.price, currentPrice.fetchedAt);
    } catch {
        logger.warn('Không fetch được giá vàng. Bỏ qua lần này.');
        return;
    }

    // 3. Lần đầu chạy → lưu giá, chờ lần sau
    if (!state.lastPrice) {
        logger.info('Chưa có giá trước đó. Lưu giá ban đầu và chờ lần chạy tiếp theo.');
        state.lastPrice = currentPrice;
        saveState(state);
        return;
    }

    const previousPrice = state.lastPrice;

    // 4. Không thay đổi → không gửi
    if (currentPrice.price === previousPrice.price) {
        logger.info(`Giá không thay đổi (${currentPrice.price.toLocaleString('vi-VN')} VNĐ). Không gửi alert.`);
        state.lastPrice = currentPrice;
        saveState(state);
        return;
    }

    // 5. Giá thay đổi → gửi alert
    const percentChange = calcPercentChange(currentPrice.price, previousPrice.price);
    const direction: AlertDirection = percentChange >= 0 ? 'UP' : 'DOWN';

    logger.info(
        `Giá thay đổi: ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}% ` +
        `(${previousPrice.price.toLocaleString('vi-VN')} → ${currentPrice.price.toLocaleString('vi-VN')} VNĐ)`,
    );

    const payload: AlertPayload = {
        currentPrice,
        previousPrice,
        percentChange,
        direction,
    };

    try {
        await sendTelegramAlert(payload);
        state.lastAlertAt = new Date().toISOString();
        state.lastAlertDirection = direction;
        logger.info(`✅ Alert đã gửi! Hướng: ${direction}, Thay đổi: ${percentChange.toFixed(2)}%`);
    } catch {
        logger.error('❌ Gửi alert thất bại.');
    }

    // 6. Lưu state
    state.lastPrice = currentPrice;
    saveState(state);
    logger.info('─── Monitor: hoàn thành ───');
}
