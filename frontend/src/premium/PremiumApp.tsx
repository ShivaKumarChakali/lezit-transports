import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PremiumLayout from './layout/layout';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import PaymentsPage from './pages/PaymentsPage';
import DriverAssignmentPage from './pages/DriverAssignmentPage';
import AdminPanelPage from './pages/AdminPanelPage';

const PremiumApp: React.FC = () => {
  return (
    <PremiumLayout>
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="driver-assignment" element={<DriverAssignmentPage />} />
        <Route path="admin" element={<AdminPanelPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </PremiumLayout>
  );
};

export default PremiumApp;
