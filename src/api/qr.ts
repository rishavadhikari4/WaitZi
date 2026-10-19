import type { OrderingPage, QrAnalytics, QrCodeResult } from '../types/api';

import { http } from './axios';

// ── Guests: the ordering page (table + restaurant + orderable menu) ─────────

/** New stickers: /t/<qrToken>. */
export const getOrderingPageByToken = (qrToken: string) => http.get<OrderingPage>(`/public/qr/${qrToken}`);

/** Table uuid, or the Mongo id printed on stickers made before the Postgres move. */
export const getOrderingPageData = (tableId: string) => http.get<OrderingPage>(`/public/tables/${tableId}/ordering`);

/** Number-only links; the server's DEFAULT_ORG_SLUG picks the restaurant unless `org` is given. */
export const getOrderingPageByNumber = (tableNumber: string | number, org?: string) =>
  http.get<OrderingPage>(`/public/tables/number/${tableNumber}/ordering`, { params: org ? { org } : undefined });

// ── Staff: QR codes for tables ──────────────────────────────────────────────

export const generateQR = (tableId: string) => http.get<QrCodeResult>(`/client/tables/${tableId}/qr`);

export const downloadQR = (tableId: string, format: 'png' | 'svg' = 'png') =>
  http.blob(`/client/tables/${tableId}/qr/download`, { params: { format } });

export const generateAllQRs = () => http.get<QrCodeResult[]>('/client/tables/qr/all');

export const getQRAnalytics = (tableId: string) => http.get<QrAnalytics>(`/client/tables/${tableId}/qr/analytics`);
