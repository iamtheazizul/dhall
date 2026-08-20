import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function ManageHours() {
  const [hours, setHours] = useState({
    days: [],
    stations: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hours`, {
        headers: getAuthHeader()  // ← ADD THIS
      });
      if (response.ok) {
        const data = await response.json();
        setHours(data);
      }
    } catch (err) {
      console.error('Error fetching hours:', err);
      setError('Failed to load hours');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (index, field, value) => {
    const newDays = [...hours.days];
    newDays[index][field] = value;
    setHours({ ...hours, days: newDays });
  };

  const handleStationChange = (index, field, value) => {
    const newStations = [...hours.stations];
    newStations[index][field] = value;
    setHours({ ...hours, stations: newStations });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
        const response = await fetch(`${API_BASE_URL}/hours`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(hours)
        });

        if (!response.ok) {
        throw new Error('Failed to save hours');
        }

        setSuccess('Hours updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
        setError(err.message);
    } finally {
        setSaving(false);
    }
    };
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-brand-green mb-6">Manage Dining Hours</h1>

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

        {/* Daily Hours */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Daily Hours</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Day</th>
                  <th className="border border-gray-300 p-3 text-left">Breakfast</th>
                  <th className="border border-gray-300 p-3 text-left">Lunch</th>
                  <th className="border border-gray-300 p-3 text-left">Dinner</th>
                  <th className="border border-gray-300 p-3 text-left">Late Night</th>
                </tr>
              </thead>
              <tbody>
                {hours.days.map((day, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={day.day}
                        onChange={(e) => handleDayChange(index, 'day', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={day.breakfast}
                        onChange={(e) => handleDayChange(index, 'breakfast', e.target.value)}
                        placeholder="e.g., 7:00 AM - 11:00 AM"
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={day.lunch}
                        onChange={(e) => handleDayChange(index, 'lunch', e.target.value)}
                        placeholder="e.g., 11:00 AM - 2:00 PM"
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={day.dinner}
                        onChange={(e) => handleDayChange(index, 'dinner', e.target.value)}
                        placeholder="e.g., 5:00 PM - 8:00 PM"
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={day.late_night || ''}
                        onChange={(e) => handleDayChange(index, 'late_night', e.target.value)}
                        placeholder="Optional"
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Station Hours */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Station Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hours.stations.map((station, index) => (
              <div key={index} className="flex gap-3 items-center p-4 border border-gray-300 rounded-lg">
                <input
                  type="text"
                  value={station.name}
                  onChange={(e) => handleStationChange(index, 'name', e.target.value)}
                  placeholder="Station name"
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <input
                  type="text"
                  value={station.hours}
                  onChange={(e) => handleStationChange(index, 'hours', e.target.value)}
                  placeholder="e.g., 7:00 AM - 8:00 PM"
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-brand-green hover:bg-brand-green-dark text-white px-8 py-3 rounded-md font-semibold transition ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageHours;