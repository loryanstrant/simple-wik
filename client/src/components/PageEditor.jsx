import React, { useState } from 'react';
import { Box, Button, Paper, TextField } from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import Editor from '@monaco-editor/react';

const PageEditor = ({ page, onSave, onCancel }) => {
  const [content, setContent] = useState(page.markdown || '');
  const [metadata, setMetadata] = useState(page.metadata || {});

  const handleSave = () => {
    onSave(content, metadata);
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={2} sx={{ height: 'calc(100vh - 200px)' }}>
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={content}
          onChange={setContent}
          theme="vs-light"
          loading="Loading editor..."
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </Paper>
    </Box>
  );
};

export default PageEditor;