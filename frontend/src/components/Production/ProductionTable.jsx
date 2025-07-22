import React from 'react';

const statutColorMap = {
  'Terminé': 'bg-green-100 text-green-700',
  'En cours': 'bg-blue-100 text-blue-700',
  'En attente': 'bg-yellow-100 text-yellow-700',
  'Annulé': 'bg-red-100 text-red-700',
};

export default function ProductionTable({ lots_production }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">Lots de Production</h3>
      <p className="text-gray-400 text-sm mb-4">Suivi des lots de production récents</p>
      <hr className="border-gray-300 mb-2" />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left border-b border-gray-200">
              <th className="py-2 px-4 font-semibold">Lot</th>
              <th className="py-2 px-4 font-semibold">Article</th>
              <th className="py-2 px-4 font-semibold">Quantité</th>
              <th className="py-2 px-4 font-semibold">Date</th>
              <th className="py-2 px-4 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {lots_production.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-200 last:border-b-0">
                <td className="py-3 px-4 font-semibold text-gray-700">{row.lot}</td>
                <td className="py-3 px-4">{row.article}</td>
                <td className="py-3 px-4">{row.quantite}</td>
                <td className="py-3 px-4">{row.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statutColorMap[row.statut] || 'bg-gray-100 text-gray-700'}`}>
                    {row.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 