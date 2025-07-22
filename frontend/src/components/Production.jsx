import React, { useState, useEffect } from 'react';
import ProductionStateCards from './Production/ProductionStateCards';
import ProductionCharts from './Production/ProductionCharts';
import ProductionTable from './Production/ProductionTable';

export default function Production() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.VITE_API_URL}/api/production-dashboard`)
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

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <main className="px-4 xl:px-[72px] py-6">
      <ProductionStateCards kpis={data.kpis} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <ProductionCharts production_quotidienne={data.production_quotidienne} arrets_par_type={data.arrets_par_type} />
      </div>
      <div className="my-8">
        <ProductionTable lots_production={data.lots_production} />
      </div>
    </main>
  );
} 