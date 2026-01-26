"use client";

/**
 * Editable Data Table Component
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Displays parsed schedule data in editable table
 * - Allows inline editing of cells
 * - Shows validation status (green/red badges)
 * - NO business logic (just UI)
 * 
 * Props:
 * - data: Array of row objects
 * - columns: Column definitions
 * - onCellEdit: Callback when cell is edited
 * - readonly: Disable editing
 */

import { useState } from "react";
import { Card } from "@/components/ui/Card";

export interface TableColumn {
  key: string;
  label: string;
  editable?: boolean;
  type?: 'text' | 'number' | 'date';
  width?: string;
}

export interface TableRow {
  id: string;
  [key: string]: string | number | boolean | null;
  _status?: 'valid' | 'warning' | 'error';
  _errors?: string[];
}

interface EditableDataTableProps {
  title: string;
  data: TableRow[];
  columns: TableColumn[];
  onCellEdit?: (rowId: string, columnKey: string, newValue: string) => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export function EditableDataTable({
  title,
  data,
  columns,
  onCellEdit,
  readonly = false,
  isLoading = false,
}: EditableDataTableProps) {
  const [editingCell, setEditingCell] = useState<{rowId: string; columnKey: string} | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleCellClick = (rowId: string, columnKey: string, currentValue: string) => {
    if (readonly) return;
    
    const column = columns.find(c => c.key === columnKey);
    if (column?.editable === false) return;

    setEditingCell({ rowId, columnKey });
    setEditValue(String(currentValue || ''));
  };

  const handleCellBlur = () => {
    if (editingCell && onCellEdit) {
      onCellEdit(editingCell.rowId, editingCell.columnKey, editValue);
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const getStatusColor = (status?: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid': return 'bg-green-900/20 border-green-700/40';
      case 'warning': return 'bg-yellow-900/20 border-yellow-700/40';
      case 'error': return 'bg-red-900/20 border-red-700/40';
      default: return '';
    }
  };

  const getStatusIcon = (status?: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return (
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card variant="feature" size="large">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-xs text-gray-500">{data.length} rows</span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading data...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-400">No data to display</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                    Status
                  </th>
                  {columns.map(column => (
                    <th 
                      key={column.key}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                      style={{ width: column.width }}
                    >
                      {column.label}
                      {column.editable !== false && !readonly && (
                        <span className="ml-1 text-cyan-400">*</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className={`transition-colors ${getStatusColor(row._status)}`}
                  >
                    {/* Row Number */}
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {index + 1}
                    </td>

                    {/* Status Icon */}
                    <td className="px-3 py-2">
                      {getStatusIcon(row._status)}
                    </td>

                    {/* Data Cells */}
                    {columns.map(column => {
                      const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === column.key;
                      const value = row[column.key];
                      const isEditable = column.editable !== false && !readonly;

                      return (
                        <td 
                          key={column.key} 
                          className={`px-3 py-2 ${isEditable ? 'cursor-pointer hover:bg-gray-800/50' : ''}`}
                          onClick={() => isEditable && handleCellClick(row.id, column.key, String(value || ''))}
                        >
                          {isEditing ? (
                            <input
                              type={column.type || 'text'}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="w-full bg-gray-900 border border-cyan-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                          ) : (
                            <span className="text-white">{String(value || '-')}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Help Text */}
        {!readonly && data.length > 0 && (
          <p className="text-xs text-gray-500 italic">
            Click any cell with * to edit. Press Enter to save, Escape to cancel.
          </p>
        )}

        {/* Errors Display */}
        {data.some(row => row._errors && row._errors.length > 0) && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-400">Validation Errors:</p>
            <div className="space-y-1">
              {data.map((row, index) => 
                row._errors?.map((error, errorIndex) => (
                  <div key={`${row.id}-${errorIndex}`} className="text-xs text-red-300 flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>Row {index + 1}: {error}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
