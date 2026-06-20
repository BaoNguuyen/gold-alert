import { loadHistory } from '../services/storage.service';
import { generateChartUrl } from '../services/chart.service';
import { sendTelegramPhoto } from '../services/telegram.service';
import { logger } from '../utils/logger';

function formatPrice(price: number): string {
    return price.toLocaleString('vi-VN');
}

/**
 * Chạy một lần: tạo báo cáo 24h và gửi biểu đồ Telegram.
 * Được gọi bởi GitHub Actions theo lịch (8h sáng VN).
 */
export async function sendDailyReport(): Promise<void> {
    logger.info('─── Daily Report: bắt đầu ───');

    const history = loadHistory();
    if (history.length < 2) {
        logger.info('Chưa đủ dữ liệu lịch sử để tạo báo cáo.');
        return;
    }

    // 24 điểm gần nhất (≈ 24 tiếng)
    const recentHistory = history.slice(-24);

    let high = recentHistory[0].price;
    let low = recentHistory[0].price;

    for (const point of recentHistory) {
        if (point.price > high) high = point.price;
        if (point.price < low) low = point.price;
    }

    const currentPrice = recentHistory[recentHistory.length - 1].price;
    const chartUrl = generateChartUrl(recentHistory);

    const caption = [
        `📊 *BÁO CÁO GIÁ VÀNG 24H QUA*`,
        ``,
        `💰 *Giá hiện tại:* ${formatPrice(currentPrice)} VNĐ`,
        `🟢 *Đỉnh cao nhất:* ${formatPrice(high)} VNĐ`,
        `🔴 *Đáy thấp nhất:* ${formatPrice(low)} VNĐ`,
        ``,
        `_Dữ liệu cập nhật từ SJC 9999_`,
    ].join('\n');

    try {
        await sendTelegramPhoto(chartUrl, caption);
        logger.info('✅ Daily report đã gửi.');
    } catch (err) {
        logger.error('❌ Gửi daily report thất bại.', err);
    }

    logger.info('─── Daily Report: hoàn thành ───');
}
