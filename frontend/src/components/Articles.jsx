import React, { useState, useEffect } from 'react';

const tableOptions = [
  { label: 'Articles', value: 'articles' },
  { label: 'Visites Qualité', value: 'visites_qualite' },
  { label: 'Défauts', value: 'defauts' },
  { label: 'Production', value: 'production' },
  { label: 'Machines', value: 'machines' },
  { label: 'Arrêts', value: 'arrets' },
];

const categoryColors = new Map([
  ['flacon hdpe', 'bg-blue-400'],
  ['bouteille pet', 'bg-red-400'],
  ['bidon pe', 'bg-green-400'],
  ['preforme', 'bg-yellow-400'],
  ['bouchon pp', 'bg-pink-400'],
  ['jerrican', 'bg-purple-400'],
  ['seau plastique', 'bg-teal-400'],
  ['tube plastique', 'bg-orange-400'],
  // Add more as needed
]);

const fallbackColors = [
  'bg-blue-300', 'bg-red-300', 'bg-green-300', 'bg-yellow-300',
  'bg-pink-300', 'bg-purple-300', 'bg-teal-300', 'bg-orange-300'
];

function getCategoryColor(category) {
  const key = category ? category.toLowerCase().trim() : '';
  if (categoryColors.has(key)) return categoryColors.get(key);
  if (key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
    return fallbackColors[Math.abs(hash) % fallbackColors.length];
  }
  return 'bg-gray-400';
}

function getTableColumns(selected) {
  switch (selected) {
    case 'articles':
      return [
        { key: 'id', label: 'ID' },
        { key: 'code_article', label: 'Code Article' },
        { key: 'nom_article', label: 'Nom Article' },
        { key: 'categorie', label: 'Catégorie', render: v => {
          const color = getCategoryColor(v);
          return (
            <span className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 align-middle ${color}`}></span>
              <span className="text-gray-700">{v}</span>
            </span>
          );
        } },
      ];
    case 'visites_qualite':
      return [
        { key: 'id', label: 'ID' },
        { key: 'code_visite', label: 'Code Visite' },
        { key: 'article_id', label: 'Article ID' },
        { key: 'date_visite', label: 'Date Visite' },
        { key: 'nb_defauts', label: 'Nb Défauts' },
        { key: 'nb_points', label: 'Nb Points' },
        { key: 'nb_sonnettes', label: 'Nb Sonnettes' },
        { key: 'defauts_majeurs', label: 'Défaut Majeur' },
        { key: 'volume_ml', label: 'Volume (ml)' },
      ];
    case 'defauts':
      return [
        { key: 'id', label: 'ID' },
        { key: 'visite_id', label: 'Visite ID' },
        { key: 'code_defaut', label: 'Code Défaut' },
        { key: 'valeur_mesure', label: 'Valeur Mesure' },
        { key: 'points_penalite', label: 'Points Pénalité' },
        { key: 'date_enregistrement', label: 'Date Enregistrement' },
      ];
    case 'production':
      return [
        { key: 'id', label: 'ID' },
        { key: 'article_id', label: 'Article ID' },
        { key: 'date', label: 'Date' },
        { key: 'quantite_produite', label: 'Quantité Produite' },
        { key: 'quantite_dechet', label: 'Quantité Déchet' },
      ];
    case 'machines':
      return [
        { key: 'id', label: 'ID' },
        { key: 'code_machine', label: 'Code Machine' },
        { key: 'nom_machine', label: 'Nom Machine' },
        { key: 'etat', label: 'État' },
      ];
    case 'arrets':
      return [
        { key: 'id', label: 'ID' },
        { key: 'type_arret', label: 'Type Arrêt' },
        { key: 'machine_id', label: 'Machine ID' },
        { key: 'date_arret', label: 'Date Arrêt' },
        { key: 'duree_minutes', label: 'Durée (min)' },
        { key: 'lot_id', label: 'Lot ID' },
        { key: 'commentaire', label: 'Commentaire' },
      ];
    default:
      return [];
  }
}

export default function Articles() {
  const [selectedTable, setSelectedTable] = useState('articles');
  const [search, setSearch] = useState('');
  const [tableData, setTableData] = useState({
    articles: [],
    visites_qualite: [],
    defauts: [],
    production: [],
    machines: [],
    arrets: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Map selectedTable to the correct key in the API response
    const keyMap = {
      articles: 'articles',
      visites_qualite: 'visites_qualite',
      defauts: 'defauts',
      production: 'production',
      machines: 'machines',
      arrets: 'arrets',
    };
    fetch(`${import.meta.env.VITE_API_URL}/api/${selectedTable}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement');
        return res.json();
      })
      .then(data => {
        setTableData(prev => ({ ...prev, [selectedTable]: data[keyMap[selectedTable]] || [] }));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedTable]);

  const columns = getTableColumns(selectedTable);
  const data = tableData[selectedTable] || [];
  const filteredData = data.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <main className="px-4 xl:px-[72px] py-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold flex-1">Tables de la Base de Données</h1>
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-60"
          value={selectedTable}
          onChange={e => setSelectedTable(e.target.value)}
        >
          {tableOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
          placeholder="Rechercher dans la table..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="bg-white rounded-xl shadow p-6 w-full overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-gray-500 text-left border-b border-gray-200">
              {columns.map(col => (
                <th key={col.key} className="py-2 px-4 font-semibold">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-gray-500 py-12">Aucune donnée trouvée.</td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition">
                  {columns.map(col => (
                    <td key={col.key} className="py-3 px-4">
                      {col.render
                        ? <>{col.render(row[col.key], row)}</>
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
} 