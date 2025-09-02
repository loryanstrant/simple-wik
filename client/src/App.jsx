import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import WikiLayout from './components/WikiLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Simple Rick inspired color themes
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#D2691E' : '#CD853F', // Warm chocolate brown
    },
    secondary: {
      main: mode === 'light' ? '#DAA520' : '#F4A460', // Golden/sandy brown
    },
    background: {
      default: mode === 'light' ? '#FFF8DC' : '#2F1B14', // Cornsilk / dark brown
      paper: mode === 'light' ? '#FFFFFF' : '#3C2415', // White / darker brown
    },
    text: {
      primary: mode === 'light' ? '#5D4037' : '#F5DEB3', // Dark brown / wheat
      secondary: mode === 'light' ? '#8D6E63' : '#DEB887', // Medium brown / burlywood
    },
    warning: {
      main: '#FF8C00', // Dark orange (like cookies baking)
    },
    info: {
      main: mode === 'light' ? '#8FBC8F' : '#98FB98', // Sage green
    },
  },
  typography: {
    fontFamily: '"Inter", "Georgia", "serif"', // More homey, readable font
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#D2691E' : '#2F1B14',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('simple-wik-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = getTheme(darkMode ? 'dark' : 'light');

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('simple-wik-dark-mode', JSON.stringify(newMode));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <WikiLayout darkMode={darkMode} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: darkMode ? '#3C2415' : '#FFFFFF',
            color: darkMode ? '#F5DEB3' : '#5D4037',
            border: `1px solid ${darkMode ? '#CD853F' : '#D2691E'}`,
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;