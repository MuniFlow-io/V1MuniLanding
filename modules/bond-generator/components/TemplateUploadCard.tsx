/**
 * Template Upload Card Component
 *
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - NO hooks
 * - NO business logic
 * - Just renders UI based on props
 * - Maximum 150 lines
 */

import { CheckCircle, CloudUpload } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

interface TemplateUploadCardProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  tags?: string[];
  isLoading?: boolean;
}

export function TemplateUploadCard(props: TemplateUploadCardProps) {
  const { file, onFileSelect, disabled, tags, isLoading } = props;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  return (
    <Box>
      {file ? (
        <Card sx={{ bgcolor: 'grey.50', border: 1, borderColor: 'grey.300' }}>
          <CardContent>
            {/* File Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle
                sx={{
                  mr: 1.5,
                  color: tags && tags.length > 0 ? 'success.main' : 'text.secondary',
                  fontSize: 28,
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight="600">
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(1)} KB
                  {tags && tags.length > 0 && ` • ${tags.length} tags assigned`}
                </Typography>
              </Box>
            </Box>

            {/* Change File Button */}
            <Button
              variant="outlined"
              size="medium"
              fullWidth
              onClick={() => onFileSelect(null)}
              disabled={disabled || isLoading}
            >
              Change File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          <input
            accept=".docx"
            style={{ display: 'none' }}
            id="template-upload"
            type="file"
            onChange={handleFileChange}
            disabled={disabled || isLoading}
          />
          <label htmlFor="template-upload">
            <Button
              variant="contained"
              component="span"
              fullWidth
              size="large"
              startIcon={<CloudUpload />}
              disabled={disabled || isLoading}
              sx={{ py: 2 }}
            >
              {isLoading ? 'Uploading...' : 'Upload DOCX Template'}
            </Button>
          </label>
        </Box>
      )}
    </Box>
  );
}
