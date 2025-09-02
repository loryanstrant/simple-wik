import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const PageViewer = ({ page }) => {
  const tags = page.metadata?.tags || [];
  
  return (
    <Paper elevation={2} sx={{ p: 4, minHeight: 'calc(100vh - 200px)' }}>
      <Box className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {page.markdown}
        </ReactMarkdown>
      </Box>
      
      {tags.length > 0 && (
        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocalOffer fontSize="small" color="action" />
            <Typography variant="subtitle2" color="text.secondary">
              Tags
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>
      )}
      
      {page.lastModified && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
          Last modified: {new Date(page.lastModified).toLocaleString()}
        </Typography>
      )}
    </Paper>
  );
};

export default PageViewer;