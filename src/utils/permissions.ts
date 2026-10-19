import type { User } from '../types/api';

/** Mirrors WaitZi_Backend/src/constants/permissions.ts. */
export type Permission =
  | 'org.settings' | 'branch.manage' | 'branding.manage' | 'domain.manage' | 'gateway.manage' | 'notification.manage' | 'audit.view'
  | 'staff.view' | 'staff.manage' | 'role.manage'
  | 'menu.view' | 'menu.manage' | 'menu.86'
  | 'table.view' | 'table.manage' | 'table.transfer'
  | 'order.view' | 'order.create' | 'order.edit' | 'order.serve' | 'order.cancel' | 'kot.view' | 'kot.update'
  | 'payment.view' | 'payment.create' | 'payment.qr' | 'payment.refund' | 'refund.approve' | 'void.approve'
  | 'discount.apply' | 'discount.approve' | 'drawer.manage' | 'invoice.print' | 'report.view'
  | 'stock.view' | 'stock.manage' | 'recipe.manage' | 'supplier.manage' | 'purchase.manage';

/** The server is the real gate; this only decides what the UI offers. */
export function can(user: User | null | undefined, perm: Permission): boolean {
  const granted = user?.role?.permissions ?? [];
  return granted.includes('*') || granted.includes(perm);
}

export function canAny(user: User | null | undefined, perms: Permission[]): boolean {
  return perms.some((p) => can(user, p));
}
