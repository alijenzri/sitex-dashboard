import React, { useState, useRef } from 'react';
import { FaFileAlt, FaBug, FaClipboardCheck, FaCalendarAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import sitexLogo from '../assets/sitex-logo.jpeg';

const REPORT_TYPES = [
  { label: 'Mesures des articles', value: 'article_measurements', icon: <FaFileAlt className="text-blue-600 text-3xl" /> },
  { label: 'Détails des défauts', value: 'defect_details', icon: <FaBug className="text-red-500 text-3xl" /> },
  { label: 'Rapport de visite qualité', value: 'quality_visit_report', icon: <FaClipboardCheck className="text-green-600 text-3xl" /> },
];

const PREVIEW_CONFIG = {
  article_measurements: {
    description: "Aperçu des mesures enregistrées pour chaque article durant la période sélectionnée.",
    icon: <FaFileAlt className="text-blue-600 text-2xl mr-2" />,
    columns: [
      { key: 'article', label: 'Article' },
      { key: 'quantite_produite', label: 'Quantité produite' },
      { key: 'quantite_dechet', label: 'Quantité de déchet' },
      { key: 'date', label: 'Date' },
    ],
  },
  defect_details: {
    description: "Aperçu des défauts détectés et leur nombre pour chaque jour de la période.",
    icon: <FaBug className="text-red-500 text-2xl mr-2" />,
    columns: [
      { key: 'article', label: 'Article' },
      { key: 'code_defaut', label: 'Code défaut' },
      { key: 'valeur_mesure', label: 'Valeur mesurée' },
      { key: 'points_penalite', label: 'Points pénalité' },
      { key: 'date', label: 'Date' },
    ],
  },
  quality_visit_report: {
    description: "Aperçu des résultats des visites qualité pour la période sélectionnée.",
    icon: <FaClipboardCheck className="text-green-600 text-2xl mr-2" />,
    columns: [
      { key: 'article', label: 'Article' },
      { key: 'date_visite', label: 'Date de visite' },
      { key: 'nb_defauts', label: 'Défauts' },
      { key: 'nb_points', label: 'Points' },
      { key: 'nb_sonnettes', label: 'Sonnettes' },
      { key: 'defauts_majeurs', label: 'Défauts majeurs' },
      { key: 'volume_ml', label: 'Volume (ml)' },
    ],
  },
};

function Toast({ type, message, onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 min-w-[260px] max-w-xs flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-fade-in-fast
      ${type === 'success' ? 'bg-green-50 border border-green-300 text-green-800' : ''}
      ${type === 'error' ? 'bg-red-50 border border-red-300 text-red-800' : ''}
      ${type === 'info' ? 'bg-blue-50 border border-blue-300 text-blue-800' : ''}
    `}>
      {type === 'success' && <FaCheckCircle className="text-green-500 text-xl" />}
      {type === 'error' && <FaExclamationCircle className="text-red-500 text-xl" />}
      <span className="flex-1 text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 text-lg font-bold text-gray-400 hover:text-gray-700">×</button>
    </div>
  );
}

export default function ReportsCenter() {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0].value);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [previewData, setPreviewData] = useState([]);
  const [toast, setToast] = useState(null);
  const downloadBtnRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReportGenerated(false);
    setPreviewData([]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: selectedReport,
          date_from: dateRange.from,
          date_to: dateRange.to,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast('error', result.error || 'Erreur lors de la génération du rapport.');
        setReportGenerated(false);
        setPreviewData([]);
      } else {
        setPreviewData(result.data);
        setReportGenerated(true);
        showToast('success', 'Rapport généré avec succès !');
        // Smooth scroll to download button after rendering
        setTimeout(() => {
          if (downloadBtnRef.current) {
            downloadBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      }
    } catch (err) {
      showToast('error', "Erreur de connexion au serveur.");
      setReportGenerated(false);
      setPreviewData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: selectedReport,
          date_from: dateRange.from,
          date_to: dateRange.to,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        showToast('error', 'Erreur lors de la génération du PDF.');
      }
    } catch (err) {
      showToast('error', 'Erreur de connexion au serveur.');
    }
    setLoading(false);
  };

  const previewConfig = PREVIEW_CONFIG[selectedReport];

  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 py-10 px-2 sm:px-4">
      {/* Toast Notification */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {/* Branding Header */}
      <div className="flex flex-col items-center mb-8">
        <img src={sitexLogo} alt="Logo Sitex" className="w-16 h-16 rounded mb-2" />
        <h2 className="text-3xl font-bold text-blue-800 mb-1 text-center">Centre de Rapports & Exportation</h2>
        <p className="text-gray-500 text-center max-w-md">Générez et exportez des rapports détaillés à partir de vos données de production et de qualité. Sélectionnez un type de rapport, une période, puis prévisualisez avant d'exporter.</p>
      </div>
      {/* Report Type Cards */}
      <div className="flex flex-wrap gap-4 justify-center mb-8 w-full max-w-2xl">
        {REPORT_TYPES.map(rt => (
          <button
            key={rt.value}
            className={`flex flex-col items-center p-5 rounded-xl shadow transition border-2 w-44 h-36 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white hover:scale-105 ${selectedReport === rt.value ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}`}
            onClick={() => setSelectedReport(rt.value)}
            aria-pressed={selectedReport === rt.value}
          >
            {rt.icon}
            <span className="mt-3 font-semibold text-lg text-gray-800">{rt.label}</span>
          </button>
        ))}
      </div>
      {/* Date Range Picker */}
      <form onSubmit={handleGenerate} className="bg-white rounded-xl shadow p-6 w-full max-w-md space-y-6 mb-8 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 w-full">
          <div className="flex flex-col w-full">
            <label htmlFor="date-from" className="flex items-center gap-2 text-gray-700 font-medium mb-1">
              <FaCalendarAlt className="text-blue-500" /> Du
            </label>
            <input
              id="date-from"
              type="date"
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              value={dateRange.from}
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="date-to" className="flex items-center gap-2 text-gray-700 font-medium mb-1">
              <FaCalendarAlt className="text-blue-500" /> Au
            </label>
            <input
              id="date-to"
              type="date"
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              value={dateRange.to}
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Génération...</span>
          ) : 'Générer le rapport'}
        </button>
      </form>
      {/* Preview Section */}
      {previewData.length > 0 && (
        <section className="w-full max-w-2xl animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center mb-2">
              {previewConfig.icon}
              <h3 className="text-lg font-semibold text-gray-800">Aperçu du rapport</h3>
            </div>
            <p className="text-gray-500 mb-4 text-sm">{previewConfig.description}</p>
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-sm text-left text-gray-700 border rounded overflow-hidden">
                <thead className="bg-blue-100">
                  <tr>
                    {previewConfig.columns.map(col => (
                      <th key={col.key} className="px-3 py-2">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                      {previewConfig.columns.map(col => (
                        <td key={col.key} className="px-3 py-2">{row[col.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
      {/* Download Section */}
      {reportGenerated && !loading && previewData.length > 0 && (
        <div className="text-center animate-fade-in">
          <div className="mb-4 text-green-600 font-semibold">Rapport généré avec succès pour la période sélectionnée !</div>
          <button
            ref={downloadBtnRef}
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200 transition font-semibold"
            onClick={handleDownloadPDF}
            disabled={loading}
          >
            Télécharger PDF
          </button>
        </div>
      )}
    </main>
  );
}

// Add fade-in-fast animation to App.css:
// .animate-fade-in-fast { animation: fadeInFast 0.3s ease; }
// @keyframes fadeInFast { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } } 