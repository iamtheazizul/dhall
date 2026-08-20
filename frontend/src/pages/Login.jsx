import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function Login() {
  const { user, login, loading } = useAuth();

  // If already logged in, redirect to admin
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Admin Login
        </h1>
        <p className="text-gray-600 mb-8">
          Please log in with your school Okta account to access the admin panel.
        </p>
        
        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-semibold text-lg transition shadow-md"
        >
          Login with Okta
        </button>

        <p className="text-sm text-gray-500 mt-6">
          You will be redirected to your school's login page.
        </p>
      </div>
    </div>
  );
}

export default Login;