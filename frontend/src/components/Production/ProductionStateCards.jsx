import React from 'react';

const cardDefs = [
  {
    icon: '🏭',
    title: 'Total Production',
    key: 'total_production',
    info: 'unités ce mois',
    color: 'bg-blue-600',
  },
  {
    icon: '⚙️',
    title: 'Machines Actives',
    key: 'machines',
    info: 'en fonctionnement',
    color: 'bg-green-600',
  },
  {
    icon: '📈',
    title: 'Taux de Rendement',
    key: 'taux_rendement',
    info: 'vs 90% cible',
    color: 'bg-purple-600',
  },
  {
    icon: '⏱️',
    title: 'Arrêts Non Planifiés',
    key: 'arrets_non_planifies',
    info: 'ce mois',
    color: 'bg-red-500',
  },
];

export default function ProductionStateCards({ kpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:px-20 my-5 xl:my-8">
      {cardDefs.map((card, idx) => {
        let value = '';
        if (card.key === 'machines') {
          value = `${kpis.machines_actives}/${kpis.machines_total}`;
        } else {
          value = kpis[card.key] + (card.key === 'taux_rendement' ? '%' : '');
        }
        return (
          <div key={idx} className={`flex items-center gap-4 rounded-xl p-5 shadow bg-white hover:shadow-lg transition`}>
            <div className={`text-2xl p-3 rounded-lg text-white ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.info}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 