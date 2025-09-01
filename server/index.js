const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { marked } = require('marked');
const matter = require('gray-matter');
const winston = require('winston');
require('dotenv').config();

// Initialize logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.WIKI_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');

// Single user configuration from environment
const WIKI_USERNAME = process.env.WIKI_USERNAME || 'admin';
const WIKI_PASSWORD = process.env.WIKI_PASSWORD || 'changeme';

// Warn if using defaults in production
if (process.env.NODE_ENV === 'production') {
  if (WIKI_PASSWORD === 'changeme') {
    logger.warn('WARNING: Using default password in production! Please set WIKI_PASSWORD environment variable.');
  }
  if (!process.env.JWT_SECRET) {
    logger.warn('WARNING: JWT_SECRET not set, using auto-generated secret. This will invalidate sessions on restart.');
  }
}

// Hash the password once at startup
let hashedPassword;
bcrypt.hash(WIKI_PASSWORD, 10).then(hash => {
  hashedPassword = hash;
  logger.info(`Wiki initialized with user: ${WIKI_USERNAME}`);
});

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Create a welcome page if no content exists
    const files = await fs.readdir(DATA_DIR);
    if (files.length === 0) {
      const welcomeContent = matter.stringify(
        '# Welcome to Wiki-AI\n\nYour personal knowledge base is ready!\n\n## Getting Started\n\n- Click **Edit** to modify this page\n- Use the **+** button in the sidebar to create new pages\n- Organize pages in folders for better structure\n- All content is saved as Markdown files\n\n## Features\n\n- 📝 Visual Markdown editing\n- 📁 Folder organization\n- 🔍 Full-text search\n- 💾 File-based storage (RAG-ready)\n- 🔐 Simple authentication\n\nEnjoy your wiki!',
        { title: 'Welcome', created: new Date().toISOString() }
      );
      await fs.writeFile(path.join(DATA_DIR, 'welcome.md'), welcomeContent);
      logger.info('Created welcome page');
    }
    
    logger.info('Data directory ready');
  } catch (error) {
    logger.error('Error creating directories:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit auth attempts
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username !== WIKI_USERNAME || !await bcrypt.compare(password, hashedPassword)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: WIKI_USERNAME },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, username: WIKI_USERNAME });
    logger.info(`User ${username} logged in successfully`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

// Page management routes
app.get('/api/pages', authenticateToken, async (req, res) => {
  try {
    const pages = await getPageList(DATA_DIR);
    res.json(pages);
  } catch (error) {
    logger.error('Error listing pages:', error);
    res.status(500).json({ error: 'Failed to list pages' });
  }
});

app.get('/api/pages/*', authenticateToken, async (req, res) => {
  const pagePath = req.params[0] || 'index';
  const fullPath = path.join(DATA_DIR, `${pagePath}.md`);
  
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    const { data, content: markdown } = matter(content);
    const html = marked(markdown);
    
    res.json({
      path: pagePath,
      markdown,
      html,
      metadata: data,
      lastModified: (await fs.stat(fullPath)).mtime
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Page not found' });
    } else {
      logger.error('Error reading page:', error);
      res.status(500).json({ error: 'Failed to read page' });
    }
  }
});

app.post('/api/pages/*', authenticateToken, async (req, res) => {
  const pagePath = req.params[0] || 'index';
  const { content, metadata = {} } = req.body;
  const fullPath = path.join(DATA_DIR, `${pagePath}.md`);
  
  try {
    // Validate path to prevent directory traversal
    if (pagePath.includes('..')) {
      return res.status(400).json({ error: 'Invalid page path' });
    }

    // Ensure parent directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    // Add timestamp metadata
    if (!metadata.created) {
      try {
        const stats = await fs.stat(fullPath);
        metadata.created = stats.birthtime.toISOString();
      } catch {
        metadata.created = new Date().toISOString();
      }
    }
    metadata.updated = new Date().toISOString();
    
    // Prepare content with frontmatter
    const fileContent = matter.stringify(content, metadata);
    
    // Write file
    await fs.writeFile(fullPath, fileContent, 'utf-8');
    
    res.json({
      path: pagePath,
      message: 'Page saved successfully'
    });
    
    logger.info(`Page saved: ${pagePath}`);
  } catch (error) {
    logger.error('Error saving page:', error);
    res.status(500).json({ error: 'Failed to save page' });
  }
});

app.delete('/api/pages/*', authenticateToken, async (req, res) => {
  const pagePath = req.params[0];
  const fullPath = path.join(DATA_DIR, `${pagePath}.md`);
  
  try {
    // Validate path to prevent directory traversal
    if (pagePath.includes('..')) {
      return res.status(400).json({ error: 'Invalid page path' });
    }

    await fs.unlink(fullPath);
    res.json({ message: 'Page deleted successfully' });
    logger.info(`Page deleted: ${pagePath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Page not found' });
    } else {
      logger.error('Error deleting page:', error);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  }
});

// Search functionality
app.get('/api/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.json([]);
  }
  
  try {
    const results = await searchPages(DATA_DIR, q);
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Helper functions
async function getPageList(dir, basePath = '') {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const pages = [];
    
    for (const entry of entries) {
      // Skip hidden files and directories
      if (entry.name.startsWith('.')) continue;
      
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        const subPages = await getPageList(fullPath, relativePath);
        if (subPages.length > 0) {
          pages.push({
            name: entry.name,
            path: relativePath,
            type: 'folder',
            children: subPages
          });
        }
      } else if (entry.name.endsWith('.md')) {
        const name = entry.name.replace('.md', '');
        const stats = await fs.stat(fullPath);
        pages.push({
          name,
          path: relativePath.replace('.md', '').replace(/\\/g, '/'),
          type: 'page',
          lastModified: stats.mtime,
          size: stats.size
        });
      }
    }
    
    // Sort: folders first, then alphabetically
    pages.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return pages;
  } catch (error) {
    logger.error('Error in getPageList:', error);
    return [];
  }
}

async function searchPages(dir, query, basePath = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  const searchTerm = query.toLowerCase();
  
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      const subResults = await searchPages(fullPath, query, relativePath);
      results.push(...subResults);
    } else if (entry.name.endsWith('.md')) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const { data, content: markdown } = matter(content);
        
        if (
          entry.name.toLowerCase().includes(searchTerm) ||
          markdown.toLowerCase().includes(searchTerm) ||
          JSON.stringify(data).toLowerCase().includes(searchTerm)
        ) {
          const lines = markdown.split('\n');
          const matchingLine = lines.find(line => 
            line.toLowerCase().includes(searchTerm) && line.trim().length > 0
          );
          
          results.push({
            path: relativePath.replace('.md', '').replace(/\\/g, '/'),
            title: data.title || entry.name.replace('.md', ''),
            excerpt: matchingLine ? 
              matchingLine.substring(0, 200) + (matchingLine.length > 200 ? '...' : '') :
              markdown.substring(0, 200) + (markdown.length > 200 ? '...' : ''),
            metadata: data
          });
        }
      } catch (error) {
        logger.error(`Error searching file ${fullPath}:`, error);
      }
    }
  }
  
  return results;
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Initialize and start server
let server;
async function startServer() {
  try {
    await ensureDirectories();
    
    server = app.listen(PORT, () => {
      logger.info(`Wiki-AI server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Data directory: ${DATA_DIR}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();