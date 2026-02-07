import { Bar } from "react-chartjs-2";
import { Card } from "../common/Card";

export function DepartmentAttendanceChart() {
    const departmentData = {
        labels: ['CS', 'IT', 'ECE', 'EEE', 'Mech'],
        datasets: [
            {
                label: 'Avg Attendance %',
                data: [92, 88, 85, 82, 90],
                backgroundColor: 'rgba(139, 92, 246, 0.7)', // Purple
                borderRadius: 4,
            }
        ]
    };

    return (
        <Card>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Department Attendance</h3>
            <div className="h-[250px]">
                <Bar 
                    data={departmentData}
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
