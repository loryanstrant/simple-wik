import React, { useState } from 'react';
import { Box, Button, Paper, TextField, Grid, Typography, Divider } from '@mui/material';
import { Save, Cancel, Edit } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import TagInput from './TagInput';

const PageEditor = ({ page, onSave, onCancel, allTags = [] }) => {
  const [content, setContent] = useState(page.markdown || '');
  const [metadata, setMetadata] = useState(page.metadata || {});
  const [title, setTitle] = useState(page.metadata?.title || page.title || '');
  const [tags, setTags] = useState(page.metadata?.tags || []);

  const handleSave = () => {
    const updatedMetadata = {
      ...metadata,
      title: title.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      modified: new Date().toISOString(),
    };
    
    onSave(content, updatedMetadata);
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Edit color="primary" />
          <Typography variant="h6">Editing: {page.path}</Typography>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Page Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your page a sweet title"
              helperText="Optional - displays in navigation and page header"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TagInput
              tags={tags}
              onChange={setTags}
              allTags={allTags}
            />
          </Grid>
        </Grid>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save Page
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
      
      <Paper elevation={2} sx={{ height: 'calc(100vh - 350px)' }}>
        <Editor
          height="100%"
          defaultLanguage="markdown"
          value={content}
          onChange={setContent}
          theme="vs-light"
          loading="Baking your content..."
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