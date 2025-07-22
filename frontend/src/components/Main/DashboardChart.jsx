import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardChart({ title, subtitle, labels, datasets }) {
  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            // Add % or kg depending on the dataset label
            if (datasets[0].label?.toLowerCase().includes('défaut')) return value + '%';
            if (datasets[0].label?.toLowerCase().includes('déchet')) return value + ' kg';
            return value;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full max-w-2xl mx-auto">
      <div className="mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <hr className="my-2" />
      <Bar data={data} options={options} height={260} />
    </div>
  );
}