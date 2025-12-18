export interface OrderStatus {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  { id: 'primary', label: 'Primary', color: 'bg-info', icon: 'fa-file-alt' },
  { id: 'updated', label: 'Updated', color: 'bg-warning', icon: 'fa-edit' },
  { id: 'quotation_shared', label: 'Quotation Shared', color: 'bg-primary', icon: 'fa-file-invoice' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-success', icon: 'fa-check-circle' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-info', icon: 'fa-spinner' },
  { id: 'pending_payment', label: 'Pending Payment', color: 'bg-warning', icon: 'fa-money-bill-wave' },
  { id: 'completed', label: 'Completed', color: 'bg-success', icon: 'fa-check-double' },
  { id: 'pending_feedback', label: 'Pending Feedback', color: 'bg-secondary', icon: 'fa-comments' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-danger', icon: 'fa-times-circle' }
];

