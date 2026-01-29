"use client";

/**
 * Data Preview Step Component
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Displays parsed maturity and CUSIP data in tables
 * - Allows inline editing of cells
 * - Shows validation status
 * - Fetches parsed data on mount
 * 
 * Clean, <150 lines, single responsibility
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EditableDataTable, type TableColumn, type TableRow } from "./EditableDataTable";

interface DataPreviewProps {
  maturityFile: File | null;
  cusipFile: File | null;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function DataPreview({
  maturityFile,
  cusipFile,
  onContinue,
  onBack,
  isLoading = false,
}: DataPreviewProps) {
  const [maturityData, setMaturityData] = useState<TableRow[]>([]);
  const [cusipData, setCusipData] = useState<TableRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch parsed data when files are available
  useEffect(() => {
    if (!maturityFile || !cusipFile) return;

    async function fetchParsedData() {
      setIsLoadingData(true);
      try {
        // Parse maturity schedule (maturityFile is guaranteed non-null by guard above)
        const maturityFormData = new FormData();
        maturityFormData.append('maturityFile', maturityFile as File);

        const maturityResponse = await fetch('/api/bond-generator/parse-maturity', {
          method: 'POST',
          credentials: 'include',
          body: maturityFormData,
        });

        // Parse CUSIP schedule (cusipFile is guaranteed non-null by guard above)
        const cusipFormData = new FormData();
        cusipFormData.append('cusipFile', cusipFile as File);

        const cusipResponse = await fetch('/api/bond-generator/parse-cusip', {
          method: 'POST',
          credentials: 'include',
          body: cusipFormData,
        });

        if (maturityResponse.ok) {
          const maturityResult = await maturityResponse.json();
          const rows: TableRow[] = (maturityResult.rows || []).map((row: Record<string, unknown>, index: number) => ({
            id: `mat-${index}`,
            maturity_date: String(row.maturity_date || ''),
            principal_amount: String(row.principal_amount || ''),
            coupon_rate: String(row.coupon_rate || ''),
            dated_date: String(row.dated_date || ''),
            series: String(row.series || ''),
            _status: (row.status as 'valid' | 'warning' | 'error') || 'valid',
          }));
          setMaturityData(rows);
        }

        if (cusipResponse.ok) {
          const cusipResult = await cusipResponse.json();
          const rows: TableRow[] = (cusipResult.rows || []).map((row: Record<string, unknown>, index: number) => ({
            id: `cusip-${index}`,
            cusip: String(row.cusip || ''),
            maturity_date: String(row.maturity_date || ''),
            series: String(row.series || ''),
            _status: (row.status as 'valid' | 'warning' | 'error') || 'valid',
          }));
          setCusipData(rows);
        }
      } catch {
        // Error fetching parsed data - could show error message to user
        setIsLoadingData(false);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchParsedData();
  }, [maturityFile, cusipFile]);

  // Column definitions
  const maturityColumns: TableColumn[] = [
    { key: 'maturity_date', label: 'Maturity Date', type: 'date', width: '15%' },
    { key: 'principal_amount', label: 'Principal Amount', type: 'number', width: '20%' },
    { key: 'coupon_rate', label: 'Coupon Rate (%)', type: 'number', width: '15%' },
    { key: 'dated_date', label: 'Dated Date', type: 'date', width: '15%' },
    { key: 'series', label: 'Series', width: '15%' },
  ];

  const cusipColumns: TableColumn[] = [
    { key: 'cusip', label: 'CUSIP Number', width: '30%' },
    { key: 'maturity_date', label: 'Maturity Date', type: 'date', width: '30%' },
    { key: 'series', label: 'Series', width: '20%' },
  ];

  // Handle cell edits
  const handleMaturityEdit = (rowId: string, columnKey: string, newValue: string) => {
    setMaturityData(prev => 
      prev.map(row => 
        row.id === rowId ? { ...row, [columnKey]: newValue } : row
      )
    );
  };

  const handleCusipEdit = (rowId: string, columnKey: string, newValue: string) => {
    setCusipData(prev => 
      prev.map(row => 
        row.id === rowId ? { ...row, [columnKey]: newValue } : row
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-300">Review Parsed Data</p>
            <p className="text-xs text-green-200/80 mt-1">
              Check the data below. Click any cell to edit if there are parsing errors.
            </p>
          </div>
        </div>
      </div>

      {/* Maturity Schedule Table */}
      <EditableDataTable
        title="Maturity Schedule"
        data={maturityData}
        columns={maturityColumns}
        onCellEdit={handleMaturityEdit}
        isLoading={isLoadingData}
      />

      {/* CUSIP Schedule Table */}
      <EditableDataTable
        title="CUSIP Schedule"
        data={cusipData}
        columns={cusipColumns}
        onCellEdit={handleCusipEdit}
        isLoading={isLoadingData}
      />

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button 
          variant="glass" 
          size="medium"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Back
        </Button>
        
        <Button 
          variant="primary" 
          size="medium"
          onClick={onContinue}
          disabled={isLoading || isLoadingData}
        >
          {isLoading ? 'Assembling...' : 'Continue to Assembly →'}
        </Button>
      </div>
    </div>
  );
}
