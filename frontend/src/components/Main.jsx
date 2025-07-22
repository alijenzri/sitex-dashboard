import { useState, useEffect } from 'react';
import StateCard from "./Main/stateCard";
import DashboardChart from "./Main/DashboardChart";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import CircularProgressChart from "./Main/CircularProgressChart";
import ArticleDefectsList from "./Main/ArticleDefectsList";
import ProductionWasteTable from './Main/ProductionWasteTable';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Main() {
    // State for all dashboard data
    const [kpis, setKpis] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [pieData, setPieData] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Fetch all dashboard data in parallel
        Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/api/kpis`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/production-dashboard`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/defect-rate-by-category`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/quality-objective`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/waste-reduction-objective`).then(r => r.json()),
        ]).then(([kpis, dashboard, pie, qualityObj, wasteObj]) => {
            setKpis(kpis);
            setDashboard(dashboard);
            setPieData(pie);
            setProgressData([qualityObj, wasteObj]);
            setLoading(false);
        }).catch(err => {
            setError('Erreur lors du chargement des données du tableau de bord');
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8">Chargement du tableau de bord...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!kpis || !dashboard || !pieData || progressData.length === 0) return null;

    // State cards
    const stateCards = [
        {
            icon: 'chart',
            title: 'Taux de défauts',
            value: kpis.taux_defauts.value,
            percentage: kpis.taux_defauts.change,
            info: 'depuis la période précédente',
        },
        {
            icon: 'cube',
            title: 'Déchets de production',
            value: kpis.dechets_production.value,
            percentage: kpis.dechets_production.change,
            info: 'depuis la période précédente',
        },
        {
            icon: 'check',
            title: 'Qualité moyenne',
            value: kpis.qualite_moyenne.value,
            percentage: kpis.qualite_moyenne.change,
            info: 'depuis la période précédente',
        },
        {
            icon: 'bolt',
            title: 'Efficacité de production',
            value: kpis.efficacite_production.value,
            percentage: kpis.efficacite_production.change,
            info: 'depuis la période précédente',
        },
    ];

    const productionColors = [
        "#2563eb", "#f87171", "#34d399", "#fbbf24", "#a78bfa", "#f472b6", "#60a5fa"
    ];
    const arretsColors = [
        "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#2563eb"
    ];

    // Dashboard charts
    const chartData = [
        {
            title: 'Production quotidienne',
            labels: dashboard.production_quotidienne.labels,
            datasets: [{
                label: 'Production',
                data: dashboard.production_quotidienne.data,
                backgroundColor: productionColors.slice(0, dashboard.production_quotidienne.data.length),
            }],
        },
        {
            title: 'Arrêts par type',
            labels: dashboard.arrets_par_type.labels,
            datasets: [{
                label: 'Arrêts',
                data: dashboard.arrets_par_type.data,
                backgroundColor: arretsColors.slice(0, dashboard.arrets_par_type.data.length),
            }],
        },
    ];

    return (
        <main className="px-4 xl:px-[72px] py-6">
            {/* State Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:px-20 my-5 xl:my-8">
                {stateCards.map((stat, idx) => (
                    <StateCard key={idx} {...stat} />
                ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-5 xl:my-8">
                {chartData.map((chart, idx) => (
                    <DashboardChart key={idx} {...chart} />
                ))}
            </div>
            {/* Pie Chart and Circular Progress Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5 xl:mb-8">
                {/* Pie Chart with legend at bottom */}
                <div className="bg-white rounded-xl shadow p-5 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        Taux de défauts par catégorie
                    </h3>
                    <hr className="mb-4" />
                    <div style={{ height: 320 }}>
                        {pieData && Array.isArray(pieData.datasets) && pieData.datasets.length > 0 ? (
                            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                        ) : (
                            <div className="text-gray-400 text-center py-8">Aucune donnée pour le graphique circulaire.</div>
                        )}
                    </div>
                </div>
                {/* Big Circular Progress Charts */}
                {progressData.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow p-5 flex flex-col items-center">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">{item.label}</h3>
                        <hr className="mb-4 w-full" />
                        <CircularProgressChart value={item.value} goal={item.goal} color={item.color} size={180} />
                    </div>
                ))}
            </div>
            {/* Article Defects List - full width */}
            <div className="mb-8">
                <ArticleDefectsList />
            </div>
            <div className="mb-8">
                <ProductionWasteTable />
            </div>
        </main>
    );
}
