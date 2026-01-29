'use client';

/**
 * BondInfoFormSection Component
 *
 * ARCHITECTURE: Component Layer (Layer 1) - DUMB
 * - Pure UI component
 * - NO hooks (except local UI state)
 * - NO business logic
 * - Receives data via props
 * - Maximum 150 lines
 *
 * PURPOSE:
 * - Collects bond metadata: Issuer, Title, Interest dates
 * - Values will fill {{ISSUER_NAME}}, {{BOND_TITLE}}, {{INTEREST_DATES}} tags
 */

import { Box, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getTagDisplayName } from '../utils/displayHelpers';

export interface BondInfo {
  issuerName: string;
  bondTitle: string;
  interestDates: {
    firstDate: Date | null;
    secondDate: Date | null;
  };
  bondNumbering?: {
    startingNumber: number;
    customPrefix?: string;
  };
}

interface BondInfoFormSectionProps {
  value: BondInfo;
  onChange: (bondInfo: BondInfo) => void;
  disabled?: boolean;
}

export function BondInfoFormSection({
  value,
  onChange,
  disabled = false,
}: BondInfoFormSectionProps) {
  const handleIssuerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      issuerName: event.target.value,
    });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      bondTitle: event.target.value,
    });
  };

  const handleFirstDateChange = (date: Date | null) => {
    onChange({
      ...value,
      interestDates: {
        ...value.interestDates,
        firstDate: date,
      },
    });
  };

  const handleSecondDateChange = (date: Date | null) => {
    onChange({
      ...value,
      interestDates: {
        ...value.interestDates,
        secondDate: date,
      },
    });
  };

  const handleStartingNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(event.target.value) || 1;
    onChange({
      ...value,
      bondNumbering: {
        ...value.bondNumbering,
        startingNumber: num,
      },
    });
  };

  const handleCustomPrefixChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      bondNumbering: {
        startingNumber: value.bondNumbering?.startingNumber || 1,
        customPrefix: event.target.value || undefined,
      },
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Bond Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        These values will fill the tagged fields in your bond certificate template.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Issuer Name */}
        <TextField
          label="Issuer Name"
          placeholder="e.g., City of Portland, Oregon"
          value={value.issuerName}
          onChange={handleIssuerChange}
          disabled={disabled}
          required
          fullWidth
          helperText={`Will populate ${getTagDisplayName('ISSUER_NAME')} in your template`}
        />

        {/* Bond Title */}
        <TextField
          label="Bond Title"
          placeholder="e.g., General Obligation Bonds, Series 2024A"
          value={value.bondTitle}
          onChange={handleTitleChange}
          disabled={disabled}
          required
          fullWidth
          helperText={`Will populate ${getTagDisplayName('BOND_TITLE')} in your template`}
        />

        {/* Interest Payment Dates */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
            Interest Payment Dates *
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Select two dates per year when interest is paid (e.g., June 1 and December 1)
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <DatePicker
                  label="First Payment Date"
                  value={value.interestDates.firstDate}
                  onChange={handleFirstDateChange}
                  disabled={disabled}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'e.g., June 1',
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                <DatePicker
                  label="Second Payment Date"
                  value={value.interestDates.secondDate}
                  onChange={handleSecondDateChange}
                  disabled={disabled}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      helperText: 'e.g., December 1',
                    },
                  }}
                />
              </Box>
            </Box>
          </LocalizationProvider>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Formatted as "Month Day and Month Day" (e.g., "June 1 and December 1")
          </Typography>
        </Box>

        {/* Bond Numbering Configuration */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
            Bond Numbering (Optional)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Customize how bonds are numbered. Leave blank to use defaults.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <TextField
                label="Starting Number"
                type="number"
                placeholder="1"
                value={value.bondNumbering?.startingNumber || ''}
                onChange={handleStartingNumberChange}
                disabled={disabled}
                fullWidth
                helperText="First bond will have this number"
                inputProps={{ min: 1 }}
              />
            </Box>

            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <TextField
                label="Custom Prefix"
                placeholder="e.g., 2024A"
                value={value.bondNumbering?.customPrefix || ''}
                onChange={handleCustomPrefixChange}
                disabled={disabled}
                fullWidth
                helperText="Override default series prefix"
              />
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Preview: Bonds will be numbered{' '}
            <strong>
              {value.bondNumbering?.customPrefix || 'BOND'}-
              {(value.bondNumbering?.startingNumber || 1).toString().padStart(3, '0')}
            </strong>{' '}
            and onwards
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
