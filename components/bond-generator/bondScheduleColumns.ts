import type { TableColumn } from "./EditableDataTable";

export const bondScheduleColumns: TableColumn[] = [
  { key: 'maturity_date', label: 'Maturity Year', type: 'date', width: '20%' },
  { key: 'principal_amount', label: 'Principal Amount', type: 'number', width: '25%' },
  { key: 'coupon_rate', label: 'Interest Rate (%)', type: 'number', width: '20%' },
  { key: 'cusip', label: 'CUSIP Number', width: '35%' },
];
