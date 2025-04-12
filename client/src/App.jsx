import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import JobListings from './pages/student/JobListings';
import Events from './pages/student/Events';
import Forum from './pages/student/Forum';
import Chat from './pages/student/Chat';

// Alumni Pages
import AlumniDashboard from './pages/alumni/Dashboard';
import JobManagement from './pages/alumni/JobManagement';
import EventManagement from './pages/alumni/EventManagement';
import Donations from './pages/alumni/Donations';

const App = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Protected Route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    }
    return children;
  };

  // Role-based Route wrapper
  const RoleRoute = ({ children, allowedRole }) => {
    if (user?.role !== allowedRole) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <RoleRoute allowedRole="student">
                <StudentDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/student/jobs"
            element={
              <RoleRoute allowedRole="student">
                <JobListings />
              </RoleRoute>
            }
          />
          <Route
            path="/student/events"
            element={
              <RoleRoute allowedRole="student">
                <Events />
              </RoleRoute>
            }
          />
          <Route
            path="/student/forum"
            element={
              <RoleRoute allowedRole="student">
                <Forum />
              </RoleRoute>
            }
          />
          <Route
            path="/student/chat"
            element={
              <RoleRoute allowedRole="student">
                <Chat />
              </RoleRoute>
            }
          />

          {/* Alumni Routes */}
          <Route
            path="/alumni"
            element={
              <RoleRoute allowedRole="alumni">
                <AlumniDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/alumni/jobs"
            element={
              <RoleRoute allowedRole="alumni">
                <JobManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/alumni/events"
            element={
              <RoleRoute allowedRole="alumni">
                <EventManagement />
              </RoleRoute>
            }
          />
          <Route
            path="/alumni/donations"
            element={
              <RoleRoute allowedRole="alumni">
                <Donations />
              </RoleRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              <Navigate
                to={user?.role === 'student' ? '/student' : '/alumni'}
                replace
              />
            }
          />
        </Route>
      </Routes>
    </Box>
  );
};

export default App;