import React from 'react';
import AdminSidebar from '../Sidebar/AdminSidebar';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;