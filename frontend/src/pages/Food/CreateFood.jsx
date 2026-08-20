import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function CreateFood() {
  const [formData, setFormData] = useState({
    Name: '',
    Ingredients: '',
    Restrictions: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const allergens = ['Fish', 'Shellfish', 'Soy', 'Eggs', 'Gluten', 'Dairy', 'Sesame', 'Halal', 'Pork', 'Spicy', 'Vegetarian', 'Vegan'];
  const { getAuthHeader } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRestrictionToggle = (restriction) => {
    setFormData(prev => {
      const restrictions = prev.Restrictions.includes(restriction)
        ? prev.Restrictions.filter(r => r !== restriction)
        : [...prev.Restrictions, restriction];
      return { ...prev, Restrictions: restrictions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate form
    if (!formData.Name.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        Name: formData.Name.trim(),
        Ingredients: formData.Ingredients.trim(),
        Restrictions: formData.Restrictions
      };

      console.log('Sending payload:', payload);

      // In handleSubmit:
      const response = await fetch(`${API_BASE_URL}/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add menu item');
      }

      const data = await response.json();
      console.log('Response:', data);

      setSuccess('Menu item added successfully!');
      
      // Reset form
      setFormData({ Name: '', Ingredients: '', Restrictions: [] });

      // Redirect to manage foods after 2 seconds
      setTimeout(() => {
        navigate('/admin/food/manage');
      }, 2000);
    } catch (err) {
      console.error('Error details:', err.message);
      setError(err.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
          Add Menu Item
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Add menu item form">
          {/* Name */}
          <div>
            <label htmlFor="Name" className="block text-gray-700 font-medium mb-2">
              Item Name *
            </label>
            <input
              type="text"
              name="Name"
              id="Name"
              value={formData.Name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter item name"
              required
              disabled={loading}
            />
          </div>

          {/* Ingredients */}
          <div>
            <label htmlFor="Ingredients" className="block text-gray-700 font-medium mb-2">
              Ingredients
            </label>
            <textarea
              name="Ingredients"
              id="Ingredients"
              value={formData.Ingredients}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows={4}
              placeholder="List the ingredients"
              disabled={loading}
            />
          </div>

          {/* Restrictions */}
          <div>
            <span className="block text-gray-700 font-medium mb-3">Dietary Restrictions</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
              {allergens.map(restriction => (
                <label key={restriction} className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.Restrictions.includes(restriction)}
                    onChange={() => handleRestrictionToggle(restriction)}
                    className="mr-3 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="text-gray-600">{restriction}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Adding...' : 'Add Menu Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateFood;