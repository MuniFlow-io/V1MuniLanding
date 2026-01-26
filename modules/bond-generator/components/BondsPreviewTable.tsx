/**
 * BondsPreviewTable Component
 *
 * ARCHITECTURE: Component Layer (Layer 1)
 * - Pure UI component (dumb)
 * - NO hooks
 * - NO business logic
 * - Displays data passed via props
 */

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { AssembledBond } from '../types';
import { formatDateForDisplay } from '../utils/formatDate';

interface BondsPreviewTableProps {
  bonds: AssembledBond[];
}

export function BondsPreviewTable({ bonds }: BondsPreviewTableProps) {
  // Show first 5 and last 5 if more than 10
  const displayBonds = bonds.length > 10 ? [...bonds.slice(0, 5), ...bonds.slice(-5)] : bonds;

  const showingTruncated = bonds.length > 10;

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bond #</TableCell>
              <TableCell>Series</TableCell>
              <TableCell>Maturity</TableCell>
              <TableCell align="right">Principal</TableCell>
              <TableCell>Principal (Words)</TableCell>
              <TableCell align="right">Coupon</TableCell>
              <TableCell>CUSIP Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayBonds.map((bond, index) => {
              const isGap = showingTruncated && index === 5;

              if (isGap) {
                return (
                  <TableRow key="gap">
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        ... {bonds.length - 10} more bonds ...
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow key={bond.bond_number}>
                  <TableCell>{bond.bond_number}</TableCell>
                  <TableCell>{bond.series || '-'}</TableCell>
                  <TableCell>{formatDateForDisplay(bond.maturity_date)}</TableCell>
                  <TableCell align="right">${bond.principal_amount.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{bond.principal_words}</TableCell>
                  <TableCell align="right">{bond.coupon_rate}%</TableCell>
                  <TableCell>{bond.cusip_no}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
