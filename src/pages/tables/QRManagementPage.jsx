import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Download, QrCode, BarChart3 } from 'lucide-react';
import { getAllTables } from '../../api/tables';
import { generateQR, downloadQR, generateAllQRs, getQRAnalytics } from '../../api/qr';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function QRManagementPage() {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingAnalyticsId, setViewingAnalyticsId] = useState(null);
  const [qrImages, setQrImages] = useState({});
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    getAllTables({ limit: 100 })
      .then((res) => setTables(res.data || []))
      .catch((err) => toast.error(err.message || 'Failed to load tables'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleGenerate = async (tableId) => {
    setGeneratingId(tableId);
    try {
      const res = await generateQR(tableId);
      setQrImages((prev) => ({ ...prev, [tableId]: res.data?.qrCode || res.data }));
      toast.success('QR code generated');
    } catch (err) {
      toast.error(err.message || 'Failed to generate QR');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      const res = await generateAllQRs();
      const qrCodes = res.data?.qrCodes || res.data || [];
      const newImages = {};
      qrCodes.forEach((qr) => {
        const id = qr.table?.id || qr.table?._id || qr.tableId;
        if (id && qr.qrCode) newImages[id] = qr.qrCode;
      });
      setQrImages((prev) => ({ ...prev, ...newImages }));
      toast.success(`Generated QR codes for ${qrCodes.length} tables`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate all QR codes');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleDownload = async (tableId, tableNumber) => {
    setDownloadingId(tableId);
    try {
      const blob = await downloadQR(tableId);
      const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-${tableNumber}-qr.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'Failed to download QR');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewAnalytics = async (tableId) => {
    setViewingAnalyticsId(tableId);
    try {
      const res = await getQRAnalytics(tableId);
      setAnalytics((prev) => ({ ...prev, [tableId]: res.data }));
    } catch (err) {
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setViewingAnalyticsId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader
        title="QR Code Management"
        subtitle="Generate and download QR codes for tables"
        actions={
          <Button onClick={handleGenerateAll} isLoading={isGeneratingAll}>
            <QrCode className="w-4 h-4 mr-1" /> Generate All
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table._id} className="card text-center">
            <h3 className="font-bold mb-3">Table {table.tableNumber}</h3>
            {qrImages[table._id] ? (
              <img
                src={typeof qrImages[table._id] === 'string' ? qrImages[table._id] : ''}
                alt={`QR Table ${table.tableNumber}`}
                className="w-40 h-40 mx-auto mb-3 border border-slate-200 rounded"
              />
            ) : (
              <div className="w-40 h-40 mx-auto mb-3 border-2 border-dashed border-slate-200 rounded flex items-center justify-center">
                <QrCode className="w-10 h-10 text-gray-300" />
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleGenerate(table._id)}
                disabled={generatingId === table._id}
                className={`btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 ${generatingId === table._id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {generatingId === table._id ? <Spinner size="sm" /> : null}
                {generatingId === table._id ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => handleDownload(table._id, table.tableNumber)}
                disabled={downloadingId === table._id}
                className={`btn-primary text-sm px-3 py-1.5 flex items-center gap-1 ${downloadingId === table._id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {downloadingId === table._id ? <Spinner size="sm" /> : <Download className="w-3.5 h-3.5" />}
                {downloadingId === table._id ? 'Downloading...' : 'Download'}
              </button>
              <button
                onClick={() => handleViewAnalytics(table._id)}
                disabled={viewingAnalyticsId === table._id}
                className={`btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 ${viewingAnalyticsId === table._id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {viewingAnalyticsId === table._id ? <Spinner size="sm" /> : <BarChart3 className="w-3.5 h-3.5" />}
              </button>
            </div>
            {analytics[table._id] && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between"><span>Total Scans</span><span className="font-medium">{analytics[table._id].totalScans ?? 0}</span></div>
                <div className="flex justify-between"><span>Orders via QR</span><span className="font-medium">{analytics[table._id].totalOrders ?? 0}</span></div>
                {analytics[table._id].lastScanned && (
                  <div className="flex justify-between"><span>Last Scanned</span><span className="font-medium">{new Date(analytics[table._id].lastScanned).toLocaleDateString()}</span></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
