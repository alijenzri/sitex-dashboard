import { useState, useEffect } from "react";

export default function ProductionWasteTable() {
    const [data, setData] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${import.meta.env.VITE_API_URL}/api/production-waste`)
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

    const displayedRows = expanded ? data : data.slice(0, 4);

    return (
        <div className="bg-white rounded-xl shadow p-6 w-full mt-8">
            <div>
                <h3 className="font-semibold text-lg text-gray-800">
                    Analyse des déchets par production
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                    Suivi des déchets générés par lot de production
                </p>
                <hr className="border-gray-300 mb-2" />
            </div>
            {loading && <div>Chargement...</div>}
            {error && <div className="text-red-500">{error}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 text-left border-b border-gray-200">
                            <th className="py-2 px-4 font-semibold">RÉFÉRENCE</th>
                            <th className="py-2 px-4 font-semibold">ARTICLE</th>
                            <th className="py-2 px-4 font-semibold">QUANTITÉ PRODUITE</th>
                            <th className="py-2 px-4 font-semibold">DÉCHETS (KG)</th>
                            <th className="py-2 px-4 font-semibold">TAUX DE DÉFAUTS</th>
                            <th className="py-2 px-4 font-semibold">STATUT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedRows.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-200 last:border-b-0">
                                <td className="py-3 px-4 font-semibold text-gray-700">{item.ref}</td>
                                <td className="py-3 px-4 flex items-center space-x-2">
                                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                                    <span className="text-gray-800">{item.article}</span>
                                </td>
                                <td className="py-3 px-4">{item.quantity}</td>
                                <td className="py-3 px-4">{item.waste}</td>
                                <td className="py-3 px-4">{item.defect}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.statusColor}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-center">
                <button
                    className="text-gray-700 font-medium border border-gray-200 rounded-lg px-6 py-2 hover:bg-gray-50 transition"
                    onClick={() => setExpanded((prev) => !prev)}
                    disabled={loading || error}
                >
                    {expanded ? "Voir moins" : "Voir tous"}
                </button>
            </div>
        </div>
    );
}