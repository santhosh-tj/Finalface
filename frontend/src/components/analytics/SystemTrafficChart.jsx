import { useState, useEffect } from 'react';
import { Line } from "react-chartjs-2";
import { Card } from "../common/Card";

export function SystemTrafficChart() {
    const [themeColor, setThemeColor] = useState('#06b6d4');

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setThemeColor(isDark ? '#06b6d4' : '#0891b2');
    }, []);

    const userActivityData = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
          {
            label: 'System Load',
            data: [12, 5, 85, 92, 76, 34],
            fill: true,
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            borderColor: themeColor,
            tension: 0.4,
          },
        ],
    };

    return (
        <Card className="h-full min-h-[400px]">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">System Traffic & Load (24h)</h3>
            <div className="h-[300px]">
                <Line 
                    data={userActivityData} 
                    options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: 'rgba(156, 163, 175, 0.1)' } },
                            x: { grid: { display: false } }
                        } 
                    }} 
                />
            </div>
        </Card>
    );
}
