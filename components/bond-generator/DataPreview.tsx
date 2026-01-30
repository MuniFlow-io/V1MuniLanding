"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EditableDataTable, type TableRow } from "./EditableDataTable";
import { InfoBanner } from "./InfoBanner";
import { bondScheduleColumns } from "./bondScheduleColumns";

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
  const [combinedData, setCombinedData] = useState<TableRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch parsed data when files are available
  useEffect(() => {
    if (!maturityFile || !cusipFile) return;

    async function fetchParsedData() {
      setIsLoadingData(true);
      try {
        // Parse maturity schedule
        const maturityFormData = new FormData();
        maturityFormData.append('maturityFile', maturityFile as File);

        const maturityResponse = await fetch('/api/bond-generator/parse-maturity', {
          method: 'POST',
          credentials: 'include',
          body: maturityFormData,
        });

        // Parse CUSIP schedule
        const cusipFormData = new FormData();
        cusipFormData.append('cusipFile', cusipFile as File);

        const cusipResponse = await fetch('/api/bond-generator/parse-cusip', {
          method: 'POST',
          credentials: 'include',
          body: cusipFormData,
        });

        // Merge both datasets
        if (maturityResponse.ok && cusipResponse.ok) {
          const maturityResult = await maturityResponse.json();
          const cusipResult = await cusipResponse.json();
          
          const maturityRows = maturityResult.rows || [];
          const cusipRows = cusipResult.rows || [];
          
          // Helper to merge statuses from both sources (error > warning > valid)
          const mergeStatus = (
            maturityStatus: unknown, 
            cusipStatus: unknown
          ): 'valid' | 'warning' | 'error' => {
            const s1 = (maturityStatus as 'valid' | 'warning' | 'error') || 'valid';
            const s2 = (cusipStatus as 'valid' | 'warning' | 'error') || 'valid';
            
            if (s1 === 'error' || s2 === 'error') return 'error';
            if (s1 === 'warning' || s2 === 'warning') return 'warning';
            return 'valid';
          };
          
          // Combine maturity data with CUSIPs by index (row-by-row matching)
          // Use the maximum length to preserve all data from both sources
          const maxLength = Math.max(maturityRows.length, cusipRows.length);
          const combined: TableRow[] = Array.from({ length: maxLength }, (_, index) => {
            const maturityRow = maturityRows[index];
            const cusipRow = cusipRows[index];
            
            return {
              id: `row-${index}`,
              maturity_date: maturityRow ? String(maturityRow.maturity_date || '') : '',
              principal_amount: maturityRow ? String(maturityRow.principal_amount || '') : '',
              coupon_rate: maturityRow ? String(maturityRow.coupon_rate || '') : '',
              cusip: cusipRow ? String(cusipRow.cusip || '') : '',
              _status: mergeStatus(maturityRow?.status, cusipRow?.status),
            };
          });
          
          setCombinedData(combined);
        }
      } catch {
        setIsLoadingData(false);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchParsedData();
  }, [maturityFile, cusipFile]);

  // Handle cell edits
  const handleCellEdit = (rowId: string, columnKey: string, newValue: string) => {
    setCombinedData(prev => 
      prev.map(row => 
        row.id === rowId ? { ...row, [columnKey]: newValue } : row
      )
    );
  };

  return (
    <div className="space-y-6">
      <InfoBanner
        type="success"
        title="Review Bond Schedule"
        description="Complete bond schedule with maturity details and CUSIPs. Click any cell to edit if needed."
      />

      <EditableDataTable
        title="Bond Schedule"
        data={combinedData}
        columns={bondScheduleColumns}
        onCellEdit={handleCellEdit}
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
