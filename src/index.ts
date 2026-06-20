import { logger } from './utils/logger';
import { monitorGoldPrice } from './jobs/monitor.job';
import { sendDailyReport } from './jobs/dailyReport.job';

/**
 * Entrypoint cho GitHub Actions.
 * Đọc biến môi trường ACTION để quyết định chạy job nào.
 *
 * ACTION=monitor        → fetch giá vàng, gửi alert nếu thay đổi
 * ACTION=daily-report   → gửi báo cáo 24h lên Telegram
 */
async function main(): Promise<void> {
    const action = process.env['ACTION'] ?? 'monitor';

    logger.info('==============================================');
    logger.info('  Gold Price Telegram Alert                  ');
    logger.info(`  Action: ${action}`);
    logger.info('==============================================');

    switch (action) {
        case 'monitor':
            await monitorGoldPrice();
            break;

        case 'daily-report':
            await sendDailyReport();
            break;

        default:
            logger.error(`Unknown action: "${action}". Use ACTION=monitor or ACTION=daily-report`);
            process.exit(1);
    }

    logger.info('==============================================');
    logger.info('  Done. Exiting.                             ');
    logger.info('==============================================');
    process.exit(0) ;
}

main().catch((err) => {
    logger.error('Unhandled fatal error.', err);
    process.exit(1);
});
