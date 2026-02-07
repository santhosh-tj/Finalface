import { Doughnut } from "react-chartjs-2";
import { Card } from "../common/Card";

export function AttendanceModesChart() {
    const attendanceModeData = {
        labels: ['Webcam', 'Mobile/GPS', 'Manual'],
        datasets: [
          {
            data: [65, 30, 5],
            backgroundColor: [
              'rgba(6, 182, 212, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(234, 179, 8, 0.8)',
            ],
            borderWidth: 0,
          },
        ],
    };

    return (
        <Card className="h-full flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 w-full text-left">Attendance Modes</h3>
            <div className="w-full max-w-[200px] aspect-square relative">
                <Doughnut 
                    data={attendanceModeData} 
                    options={{ 
                        cutout: '70%',
                        plugins: { legend: { position: 'bottom' } } 
                    }} 
                />
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">95%</span>
                    <span className="text-xs text-gray-400">Digital</span>
                </div>
            </div>
        </Card>
    );
}
