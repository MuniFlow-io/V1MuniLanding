/**
 * FileUploadCard Component
 *
 * ARCHITECTURE: Component Layer (Layer 1)
 * - Pure UI component (dumb)
 * - NO hooks (except local UI state)
 * - NO business logic
 * - Receives data via props
 * - Maximum 150 lines
 */

import { CloudUpload as UploadIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

interface FileUploadCardProps {
  title: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

export function FileUploadCard({
  title,
  description,
  file,
  onFileSelect,
  accept = '.xlsx,.xls',
  disabled = false,
}: FileUploadCardProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>

        <Box sx={{ textAlign: 'center', py: 2 }}>
          {file ? (
            <Box>
              <CheckIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2" fontWeight="medium">
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
          ) : (
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          )}
        </Box>

        <Button
          component="label"
          variant={file ? 'outlined' : 'contained'}
          fullWidth
          disabled={disabled}
          startIcon={<UploadIcon />}
        >
          {file ? 'Change File' : 'Upload File'}
          <input
            type="file"
            hidden
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
          />
        </Button>
      </CardContent>
    </Card>
  );
}
