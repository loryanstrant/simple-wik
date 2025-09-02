import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Warning, Delete, Cancel } from '@mui/icons-material';

const DeleteConfirmDialog = ({ open, page, onConfirm, onCancel }) => {
  if (!page) return null;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          <Typography variant="h6">Simple Cookie Crumble Warning</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete <strong>"{page.title || page.path}"</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Just like Simple Rick's cookies, once they're gone, they're gone forever. 
          This action cannot be undone.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
          "Sometimes you gotta let the cookies crumble..." - Simple Rick (probably)
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onCancel}
          startIcon={<Cancel />}
          variant="outlined"
        >
          Keep It Simple
        </Button>
        <Button
          onClick={onConfirm}
          startIcon={<Delete />}
          variant="contained"
          color="warning"
          sx={{ ml: 1 }}
        >
          Crumble Away
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;