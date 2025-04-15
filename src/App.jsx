import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext';
import { MenuProvider } from './context/MenuContext';
import { TableProvider } from './context/TableContext';

// Komponenten
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import WaiterDashboard from './components/dashboard/WaiterDashboard';
import ChefDashboard from './components/dashboard/ChefDashboard';
import ReservationsPage from './components/reservations/ReservationsPage';
import TablesPage from './components/tables/TablesPage';
import MenuPage from './components/menu/MenuPage';
import SettingsPage from './components/settings/SettingsPage';
import ProfilePage from './components/profile/ProfilePage';

// Theme erstellen
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#e3f2fd'
    },
    secondary: {
      main: '#e57373',
      light: '#ffebee'
    },
    success: {
      main: '#66bb6a',
      light: '#e8f5e9'
    },
    warning: {
      main: '#ffa726',
      light: '#fff8e1'
    },
    error: {
      main: '#f44336',
      light: '#ffebee'
    },
    info: {
      main: '#29b6f6',
      light: '#e1f5fe'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ReservationProvider>
          <MenuProvider>
            <TableProvider>
              <Router>
                <Routes>
                  {/* Öffentliche Routen */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  
                  {/* Geschützte Routen */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      {/* Dashboards für verschiedene Rollen */}
                      <Route 
                        path="/dashboard/manager" 
                        element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/dashboard/admin" 
                        element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/dashboard/waiter" 
                        element={<ProtectedRoute roles={['waiter']}><WaiterDashboard /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/dashboard/chef" 
                        element={<ProtectedRoute roles={['chef']}><ChefDashboard /></ProtectedRoute>} 
                      />
                      
                      {/* Hauptfunktionen */}
                      <Route 
                        path="/dashboard/reservations" 
                        element={<ProtectedRoute roles={['manager', 'waiter', 'chef']}><ReservationsPage /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/dashboard/tables" 
                        element={<ProtectedRoute roles={['manager', 'waiter']}><TablesPage /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/dashboard/menu" 
                        element={<ProtectedRoute roles={['manager', 'admin', 'waiter', 'chef']}><MenuPage /></ProtectedRoute>} 
                      />
                      <Route 
                        path="/dashboard/settings" 
                        element={<ProtectedRoute roles={['admin', 'manager']}><SettingsPage /></ProtectedRoute>} 
                      />
                      
                      {/* Benutzerprofil */}
                      <Route path="/dashboard/profile" element={<ProfilePage />} />
                      
                      {/* Umleitung für das Dashboard */}
                      <Route path="/dashboard" element={<Navigate to="/dashboard/manager" replace />} />
                    </Route>
                  </Route>
                  
                  {/* Umleitung für nicht gefundene Routen */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Router>
            </TableProvider>
          </MenuProvider>
        </ReservationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 