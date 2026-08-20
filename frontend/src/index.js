/* Contains the Root files and the Routes */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import App from './pages/Main/App';
import CreateFood from './pages/Food/CreateFood';
import AdminDashboard from './pages/Main/AdminDashboard';
import AdminLayout from './components/Admin/AdminLayout';
import CreateCycle from './pages/Cycle/CreateCycle';
import ManageCycles from './pages/Cycle/ManageCycles';
import ManageFoods from './pages/Food/ManageFoods';
import FoodCycle from './pages/Cycle/FoodCycle';
import HoursPage from './pages/Hours/HoursPage';
import ManageHours from './pages/Hours/ManageHours';
import ManageSlideshow from './components/App/Slideshow/ManageSlideshow';
import WeeklyMenu from './pages/WeeklyMenu'
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider> {/* Wrapper adds the authentication for the App */}
      <Routes>
        {/* Public routes */}6
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hours" element={<HoursPage />} />
        <Route path="/weekly-menu" element={<WeeklyMenu />} />
        {/* Protected admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="food/add" element={<CreateFood />} />
          <Route path="food/manage" element={<ManageFoods />} />
          <Route path="cycle/add" element={<CreateCycle />} />
          <Route path="cycle/manage" element={<ManageCycles />} />
          <Route path="cycle/:cycleId/configure" element={<FoodCycle />} />
          <Route path="hours" element={<ManageHours />} />           {/* NEW */}
          <Route path="slideshow" element={<ManageSlideshow />} />   {/* ADD THIS */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to=  "/" replace />} />
      </Routes>
    </AuthProvider> 
  </BrowserRouter>
);
