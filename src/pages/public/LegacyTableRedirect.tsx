import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';

import { getOrderingPageByNumber, getOrderingPageData } from '../../api/qr';
import EmptyState from '../../components/ui/EmptyState';
import LogoLoader from '../../components/ui/LogoLoader';

/**
 * Stickers printed before the multi-restaurant move point at
 * /order/table/<number>?tableId=<id>. Look the table up once and continue on
 * its /t/<qrToken> link, which every guest page now uses.
 */
export default function LegacyTableRedirect() {
  const { tableNumber = '' } = useParams();
  const [params] = useSearchParams();
  const tableId = params.get('tableId');
  const org = params.get('org') ?? undefined;
  const [target, setTarget] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const lookup = tableId ? getOrderingPageData(tableId) : getOrderingPageByNumber(tableNumber, org);
    lookup.then((res) => setTarget(`/t/${res.data.table.qrToken}`)).catch(() => setFailed(true));
  }, [tableId, tableNumber, org]);

  if (target) return <Navigate to={target} replace />;
  if (failed) return <EmptyState icon="mdi:qrcode-remove" title="Table not found" message="Please ask a staff member for help." />;
  return (
    <div className="flex justify-center py-20">
      <LogoLoader size="lg" />
    </div>
  );
}
