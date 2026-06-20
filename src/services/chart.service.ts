import { HistoryPoint } from '../types';

function formatNumber(num: number): string {
    return (num / 1_000_000).toFixed(1) + 'M';
}

export function generateChartUrl(history: HistoryPoint[]): string {
    if (history.length === 0) {
        return '';
    }

    // Limit to the last 24 points (approximately 24 hours) for a clean chart
    const recentHistory = history.slice(-24);

    const labels = recentHistory.map((p) => {
        const d = new Date(p.timestamp);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
    });

    const data = recentHistory.map((p) => Math.round(p.price / 1_000_000)); // To millions for y-axis

    const chartConfig = {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Gold Price (VND Millions/tael)',
                    data,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                },
            ],
        },
        options: {
            title: {
                display: true,
                text: '24-Hour Gold Price Trend (SJC 9999)',
                fontSize: 16,
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false,
                    }
                }]
            }
        },
    };

    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    return `https://quickchart.io/chart?c=${encodedConfig}&w=600&h=400&bkg=white`;
}
