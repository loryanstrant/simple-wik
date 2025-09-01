import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const PageViewer = ({ page }) => {
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
      {page.lastModified && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
          Last modified: {new Date(page.lastModified).toLocaleString()}
        </Typography>
      )}
    </Paper>
  );
};

export default PageViewer;