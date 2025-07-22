import { useState, useEffect } from "react";

export default function ArticleDefectsList() {
    const [data, setData] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${import.meta.env.VITE_API_URL}/api/article-defects`)
            .then(res => {
                if (!res.ok) throw new Error('Erreur lors du chargement');
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const displayedArticles = expanded ? data : data.slice(0, 5);

    // Color mapping logic (copied from Articles.jsx)
    const categoryColors = new Map([
        ['flacon hdpe', 'bg-blue-400'],
        ['bouteille pet', 'bg-red-400'],
        ['bidon pe', 'bg-green-400'],
        ['preforme', 'bg-yellow-400'],
        ['bouchon pp', 'bg-pink-400'],
        ['jerrican', 'bg-purple-400'],
        ['seau plastique', 'bg-teal-400'],
        ['tube plastique', 'bg-orange-400'],
        ['couture', 'bg-blue-500'],
        ['teinte', 'bg-red-500'],
        ['bouton', 'bg-green-500'],
        ['doublure', 'bg-yellow-400'],
        // Add more as needed
    ]);
    const fallbackColors = [
        'bg-blue-300', 'bg-red-300', 'bg-green-300', 'bg-yellow-300',
        'bg-pink-300', 'bg-purple-300', 'bg-teal-300', 'bg-orange-300'
    ];
    function getCategoryColor(category) {
        const key = category ? category.toLowerCase().replace('défaut', '').trim() : '';
        if (categoryColors.has(key)) return categoryColors.get(key);
        if (key) {
            let hash = 0;
            for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
            return fallbackColors[Math.abs(hash) % fallbackColors.length];
        }
        return 'bg-gray-400';
    }

    return (
        <div className="bg-white rounded-xl shadow p-6 w-full">
            <div>
                <h3 className="font-semibold text-lg text-gray-800">
                    Défauts par type d'article
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                    Analyse détaillée des défauts par article
                </p>
                <hr className="border-gray-300 mb-2" />
            </div>
            {loading && <div>Chargement...</div>}
            {error && <div className="text-red-500">{error}</div>}
            <ul>
                {displayedArticles.map((item, idx) => (
                    <li
                        key={idx}
                        className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0"
                    >
                        <div className="flex items-center space-x-3">
                            <span className={`w-3 h-3 rounded-full ${getCategoryColor(item.subtitle)}`}></span>
                            <div>
                                <div className="font-semibold text-gray-800">{item.title}</div>
                                <div className="text-gray-400 text-sm">{item.subtitle}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-800">{item.value}</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${item.statusColor}`}
                            >
                                {item.status}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-6 flex justify-center">
                <button
                    className="text-gray-700 font-medium border border-gray-200 rounded-lg px-6 py-2 hover:bg-gray-50 transition"
                    onClick={() => setExpanded((prev) => !prev)}
                    disabled={loading || error}
                >
                    {expanded ? "Voir moins" : "Voir tous les articles"}
                </button>
            </div>
        </div>
    );
}