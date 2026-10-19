import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { getAllTables } from '../../api/tables';
import { generateQR, downloadQR, generateAllQRs, getQRAnalytics } from '../../api/qr';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { SkeletonCardGrid } from '../../components/ui/Skeleton';
import type { ApiError, DiningTable, QrAnalytics } from '../../types/api';

export default function QRManagementPage() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingAnalyticsId, setViewingAnalyticsId] = useState<string | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [analytics, setAnalytics] = useState<Record<string, QrAnalytics['analytics']>>({});

  useEffect(() => {
    getAllTables({ limit: 100 })
      .then((res) => setTables(res.data || []))
      .catch((err) => toast.error((err as ApiError).message || 'Failed to load tables'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleGenerate = async (tableId: string) => {
    setGeneratingId(tableId);
    try {
      const res = await generateQR(tableId);
      const { qrCode } = res.data;
      if (qrCode) setQrImages((prev) => ({ ...prev, [tableId]: qrCode }));
      toast.success('QR code generated');
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to generate QR');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      const res = await generateAllQRs();
      const qrCodes = res.data;
      const newImages: Record<string, string> = {};
      qrCodes.forEach((qr) => {
        if (qr.qrCode) newImages[qr.table.id] = qr.qrCode;
      });
      setQrImages((prev) => ({ ...prev, ...newImages }));
      toast.success(`Generated QR codes for ${qrCodes.length} tables`);
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to generate all QR codes');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleDownload = async (tableId: string, tableNumber: number) => {
    setDownloadingId(tableId);
    try {
      const blob = await downloadQR(tableId, 'png');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-${tableNumber}-qr.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to download QR');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewAnalytics = async (tableId: string) => {
    setViewingAnalyticsId(tableId);
    try {
      const res = await getQRAnalytics(tableId);
      setAnalytics((prev) => ({ ...prev, [tableId]: res.data.analytics }));
    } catch (err) {
      toast.error((err as ApiError).message || 'Failed to load analytics');
    } finally {
      setViewingAnalyticsId(null);
    }
  };

  if (isLoading) return <SkeletonCardGrid count={8} media />;

  return (
    <div>
      <PageHeader
        title="QR Code Management"
        subtitle="Generate and download QR codes for tables"
        actions={
          <Button onClick={handleGenerateAll} isLoading={isGeneratingAll}>
            <Icon icon="mdi:qrcode" className="w-4 h-4 mr-1" /> Generate All
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="card text-center">
            <h3 className="font-mono font-bold mb-3">T{table.tableNumber}</h3>
            {qrImages[table.id] ? (
              <img
                src={typeof qrImages[table.id] === 'string' ? qrImages[table.id] : ''}
                alt={`QR Table ${table.tableNumber}`}
                className="w-40 h-40 mx-auto mb-3 border border-gray-200 rounded"
              />
            ) : (
              <div className="w-40 h-40 mx-auto mb-3 border-2 border-dashed border-gray-200 rounded flex items-center justify-center">
                <Icon icon="mdi:qrcode" className="w-10 h-10 text-gray-300" />
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleGenerate(table.id)}
                disabled={generatingId === table.id}
                className={`btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 ${generatingId === table.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {generatingId === table.id ? <Spinner size="sm" /> : null}
                {generatingId === table.id ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => handleDownload(table.id, table.tableNumber)}
                disabled={downloadingId === table.id}
                className={`btn-primary text-sm px-3 py-1.5 flex items-center gap-1 ${downloadingId === table.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {downloadingId === table.id ? <Spinner size="sm" /> : <Icon icon="mdi:download" className="w-3.5 h-3.5" />}
                {downloadingId === table.id ? 'Downloading...' : 'Download'}
              </button>
              <button
                onClick={() => handleViewAnalytics(table.id)}
                disabled={viewingAnalyticsId === table.id}
                className={`btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 ${viewingAnalyticsId === table.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {viewingAnalyticsId === table.id ? <Spinner size="sm" /> : <Icon icon="mdi:chart-bar" className="w-3.5 h-3.5" />}
              </button>
            </div>
            {analytics[table.id] && (
              <div className="mt-3 pt-3 border-t border-dashed border-gray-200 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between"><span>Orders from this table</span><span className="font-mono font-medium">{analytics[table.id].ordersFromScans}</span></div>
                {analytics[table.id].lastOrderAt && (
                  <div className="flex justify-between"><span>Last order</span><span className="font-mono font-medium">{new Date(analytics[table.id].lastOrderAt!).toLocaleDateString()}</span></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
