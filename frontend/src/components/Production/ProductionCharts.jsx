import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ProductionCharts({ production_quotidienne, arrets_par_type }) {
  const lineData = {
    labels: production_quotidienne.labels,
    datasets: [
      {
        label: 'Production Quotidienne',
        data: production_quotidienne.data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#2563eb',
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value + ' u.',
        },
      },
    },
  };

  const barData = {
    labels: arrets_par_type.labels,
    datasets: [
      {
        label: 'Arrêts',
        data: arrets_par_type.data,
        backgroundColor: [
          '#ef4444',
          '#fbbf24',
          '#22c55e',
          '#818cf8',
          '#f472b6',
          '#60a5fa',
          '#a78bfa',
        ].slice(0, arrets_par_type.data.length),
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">Production Quotidienne</h3>
        <hr className="mb-4" />
        <div style={{ height: 300 }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-1">Arrêts par Type</h3>
        <hr className="mb-4" />
        <div style={{ height: 300 }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </>
  );
} 