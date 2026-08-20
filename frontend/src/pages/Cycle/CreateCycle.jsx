import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function CreateCycle() {
  const [cycleName, setCycleName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();

  // Fetch existing cycles to suggest next order number
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cycles`, {
          headers: getAuthHeader()
        });
        if (response.ok) {
          const cycles = await response.json();
          // Suggest the next order number
          const maxOrder = Math.max(...cycles.map(c => c.order || 0), 0);
          setOrder(maxOrder + 1);
        }
      } catch (err) {
        console.error('Error fetching cycles:', err);
      }
    };
    fetchCycles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!cycleName.trim()) {
      setError('Cycle name is required');
      return;
    }

    if (order < 1) {
      setError('Order must be at least 1');
      return;
    }

    setLoading(true);
    try {
      const newCycle = {
        name: cycleName.trim(),
        description: description.trim(),
        order: order,
        is_active: false,
        days: []
      };

      // In handleSubmit:
      const response = await fetch(`${API_BASE_URL}/cycles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(newCycle)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Cycle created successfully! Redirecting...');

      setTimeout(() => {
        navigate('/admin/cycle/manage');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create cycle. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Cycle</h1>
        <p className="text-gray-600 mb-8">
          Set up a new menu cycle. Cycles rotate automatically every Friday at midnight.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cycle Name */}
          <div>
            <label htmlFor="cycleName" className="block text-gray-700 font-medium mb-2">
              Cycle Name *
            </label>
            <input
              type="text"
              id="cycleName"
              value={cycleName}
              onChange={(e) => setCycleName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., Winter Menu, Spring Week 1"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              placeholder="Optional: Add notes about this cycle"
              rows="3"
              disabled={loading}
            />
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-gray-700 font-medium mb-2">
              Rotation Order *
            </label>
            <input
              type="number"
              id="order"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Cycles rotate in order: 1 → 2 → 3 → 1... (Lower numbers come first)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-md font-semibold transition ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Creating...' : 'Create Cycle'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/cycle/manage')}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          After creating a cycle, configure its daily menus and set it as active.
        </p>
      </div>
    </div>
  );
}

export default CreateCycle;