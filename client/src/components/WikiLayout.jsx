import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  ExpandLess,
  ExpandMore,
  AccountCircle,
  Logout,
  CreateNewFolder,
  NoteAdd,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import PageEditor from './PageEditor';
import PageViewer from './PageViewer';
import axios from 'axios';
import toast from 'react-hot-toast';

const drawerWidth = 280;

const WikiLayout = ({ darkMode, toggleTheme }) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [newPageDialog, setNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await axios.get('/api/pages');
      setPages(response.data);
    } catch (error) {
      toast.error('Failed to load pages');
    }
  };

  const loadPage = async (path) => {
    try {
      const response = await axios.get(`/api/pages/${path}`);
      setSelectedPage(response.data);
      setEditMode(false);
    } catch (error) {
      if (error.response?.status === 404) {
        // Create new page
        setSelectedPage({
          path,
          markdown: `# ${path.split('/').pop()}\n\nStart writing your content here...`,
          html: '',
          metadata: { title: path.split('/').pop() }
        });
        setEditMode(true);
      } else {
        toast.error('Failed to load page');
      }
    }
  };

  const savePage = async (path, content, metadata) => {
    try {
      await axios.post(`/api/pages/${path}`, { content, metadata });
      toast.success('Page saved successfully');
      await loadPages();
      await loadPage(path);
    } catch (error) {
      toast.error('Failed to save page');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    try {
      const response = await axios.get('/api/search', {
        params: { q: searchQuery }
      });
      // Handle search results
      console.log('Search results:', response.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleNewPage = () => {
    if (!newPageName) return;
    
    const path = newPagePath ? `${newPagePath}/${newPageName}` : newPageName;
    loadPage(path);
    setNewPageDialog(false);
    setNewPageName('');
    setNewPagePath('');
  };

  const renderPageTree = (items, level = 0) => {
    return items.map((item) => {
      if (item.type === 'folder') {
        const isExpanded = expandedFolders[item.path];
        return (
          <React.Fragment key={item.path}>
            <ListItem
              button
              onClick={() => toggleFolder(item.path)}
              style={{ paddingLeft: 16 + level * 16 }}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary={item.name} />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderPageTree(item.children || [], level + 1)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      } else {
        return (
          <ListItem
            button
            key={item.path}
            onClick={() => loadPage(item.path)}
            selected={selectedPage?.path === item.path}
            style={{ paddingLeft: 16 + level * 16 }}
          >
            <ListItemIcon>
              <FileIcon />
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        );
      }
    });
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Pages
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={() => setNewPageDialog(true)} size="small">
          <AddIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Divider />
      <List>
        {renderPageTree(pages)}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {selectedPage ? selectedPage.path : 'Simple Wik'}
          </Typography>
          {selectedPage && (
            <Button
              color="inherit"
              onClick={() => setEditMode(!editMode)}
              sx={{ mr: 2 }}
            >
              {editMode ? 'View' : 'Edit'}
            </Button>
          )}
          <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{ mr: 1 }}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.username}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={logout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {selectedPage ? (
          editMode ? (
            <PageEditor
              page={selectedPage}
              onSave={(content, metadata) => savePage(selectedPage.path, content, metadata)}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <PageViewer page={selectedPage} />
          )
        ) : (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" gutterBottom>
              Welcome to Simple Wik
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Keep your knowledge simple and sweet, just like Simple Rick's life
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
              "Sometimes the best wiki is the simplest one"
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewPageDialog(true)}
              sx={{ mt: 4 }}
            >
              Bake a New Page
            </Button>
          </Box>
        )}
      </Box>

      <Dialog open={newPageDialog} onClose={() => setNewPageDialog(false)}>
        <DialogTitle>Create New Page</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Page Name"
            fullWidth
            variant="outlined"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Path (optional)"
            fullWidth
            variant="outlined"
            value={newPagePath}
            onChange={(e) => setNewPagePath(e.target.value)}
            helperText="Leave empty for root, or enter folder path like 'docs/guides'"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPageDialog(false)}>Cancel</Button>
          <Button onClick={handleNewPage} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WikiLayout;