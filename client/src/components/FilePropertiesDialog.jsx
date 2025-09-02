import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';

const FilePropertiesDialog = ({ open, page, onSave, onCancel }) => {
  const [fileName, setFileName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (page) {
      setFileName(page.path || '');
      setDisplayName(page.title || page.path || '');
      setError('');
    }
  }, [page]);

  const handleSave = () => {
    if (!fileName.trim()) {
      setError('File name cannot be empty');
      return;
    }

    if (fileName.includes('..') || fileName.includes('/') && !fileName.match(/^[a-zA-Z0-9/_-]+$/)) {
      setError('File name contains invalid characters');
      return;
    }

    onSave({
      oldPath: page.path,
      newPath: fileName.trim(),
      displayName: displayName.trim(),
    });
  };

  if (!page) return null;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit color="primary" />
          <Typography variant="h6">Page Properties</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Keep your page properties as simple and sweet as Simple Rick's recipes.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="File Path"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="e.g., recipes/simple-cookies"
          helperText="The file path determines where your page lives (like organizing recipes in folders)"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g., Simple Rick's Cookie Recipe"
          helperText="The friendly name shown in the interface"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onCancel}
          startIcon={<Cancel />}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          startIcon={<Save />}
          variant="contained"
          sx={{ ml: 1 }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePropertiesDialog;