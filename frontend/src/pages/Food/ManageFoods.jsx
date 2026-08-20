// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { API_BASE_URL } from '../../config/api';

// function ManageFoods() {
//   const [foods, setFoods] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [editFormData, setEditFormData] = useState({});
//   const navigate = useNavigate();
//   const allergens = ['Fish', 'Shellfish', 'Soy', 'Eggs', 'Gluten', 'Dairy', 'Sesame', 'Halal', 'Pork', 'Spicy', 'Vegetarian', 'Vegan'];

//   useEffect(() => {
//     fetchFoods();
//   }, []);

//   // Refetch whenever the page comes into focus
//   useEffect(() => {
//     const handleFocus = () => {
//       fetchFoods();
//     };
//     window.addEventListener('focus', handleFocus);
//     return () => window.removeEventListener('focus', handleFocus);
//   }, []);

//   const fetchFoods = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await fetch(`${API_BASE_URL}/foods`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       setFoods(data || []);
//     } catch (error) {
//       console.error('Failed to fetch foods:', error);
//       setError('Failed to load foods. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (food) => {
//     setEditingId(food.id);
//     setEditFormData({ ...food });
//   };

//   const handleSaveEdit = async () => {
//     try {
//       // Validate required fields
//       if (!editFormData.name?.trim()) {
//         alert('Food name is required');
//         return;
//       }

//       // Use query parameter instead of URL parameter
//       const response = await fetch(`${API_BASE_URL}/foods?id=${editingId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(editFormData)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const updatedFood = await response.json();
//       setFoods(foods.map(f => f.id === editingId ? updatedFood : f));
//       setEditingId(null);
//       setEditFormData({});
//       alert('Food item updated successfully!');
//     } catch (error) {
//       console.error('Failed to update food:', error);
//       alert('Failed to update food item');
//     }
//   };

//   const handleDelete = async (foodId) => {
//     if (window.confirm('Are you sure you want to delete this food item?')) {
//       try {
//         // Use query parameter instead of URL parameter
//         const response = await fetch(`${API_BASE_URL}/foods?id=${foodId}`, {
//           method: 'DELETE'
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         setFoods(foods.filter(f => f.id !== foodId));
//         alert('Food item deleted successfully!');
//       } catch (error) {
//         console.error('Failed to delete food:', error);
//         alert('Failed to delete food item');
//       }
//     }
//   };

//   const handleRestrictionToggle = (restriction) => {
//     setEditFormData(prev => {
//       const restrictions = prev.restrictions?.includes(restriction)
//         ? prev.restrictions.filter(r => r !== restriction)
//         : [...(prev.restrictions || []), restriction];
//       return { ...prev, restrictions };
//     });
//   };

//   const handleCancelEdit = () => {
//     setEditingId(null);
//     setEditFormData({});
//   };

//   if (loading) {
//     return <div className="p-6 text-center text-gray-500">Loading food items...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-800">Manage Food Items</h1>
//           <button
//             onClick={() => navigate('/admin/food/add')}
//             className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold"
//           >
//             + Add New Food
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//             {error}
//             <button
//               onClick={fetchFoods}
//               className="ml-4 underline font-semibold hover:no-underline"
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {foods.length === 0 ? (
//           <div className="bg-white rounded-lg shadow p-8 text-center">
//             <p className="text-gray-500 text-lg">No food items found. Create one to get started!</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6">
//             {foods.map(food => (
//               <div key={food.id} className="bg-white rounded-lg shadow-md p-6">
//                 {editingId === food.id ? (
//                   // Edit Mode
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-gray-700 font-medium mb-2">Name</label>
//                       <input
//                         type="text"
//                         value={editFormData.name || ''}
//                         onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
//                         className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 font-medium mb-2">Ingredients</label>
//                       <textarea
//                         value={editFormData.ingredients || ''}
//                         onChange={(e) => setEditFormData({ ...editFormData, ingredients: e.target.value })}
//                         className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         rows={3}
//                       />
//                     </div>
//                     <div>
//                       <span className="block text-gray-700 font-medium mb-2">Dietary Restrictions</span>
//                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//                         {allergens.map(restriction => (
//                           <label key={restriction} className="flex items-center cursor-pointer">
//                             <input
//                               type="checkbox"
//                               checked={editFormData.restrictions?.includes(restriction) || false}
//                               onChange={() => handleRestrictionToggle(restriction)}
//                               className="mr-2 h-4 w-4 text-blue-600 rounded"
//                             />
//                             <span className="text-sm text-gray-600">{restriction}</span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>
//                     <div className="flex gap-3 pt-4">
//                       <button
//                         onClick={handleSaveEdit}
//                         className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold"
//                       >
//                         Save Changes
//                       </button>
//                       <button
//                         onClick={handleCancelEdit}
//                         className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md font-semibold"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   // View Mode
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <h3 className="text-xl font-bold text-gray-800 mb-2">{food.name}</h3>
//                       <p className="text-gray-600 mb-3">
//                         <span className="font-semibold">Ingredients:</span> {food.ingredients}
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {food.restrictions?.map(restriction => (
//                           <span
//                             key={restriction}
//                             className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
//                           >
//                             {restriction}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                     <div className="flex gap-2 ml-4">
//                       <button
//                         onClick={() => handleEdit(food)}
//                         className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold text-sm"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(food.id)}
//                         className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-semibold text-sm"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ManageFoods;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

function ManageFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const navigate = useNavigate();
  const allergens = ['Fish', 'Shellfish', 'Soy', 'Eggs', 'Gluten', 'Dairy', 'Sesame', 'Halal', 'Pork', 'Spicy', 'Vegetarian', 'Vegan'];
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchFoods();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/foods`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFoods(data || []);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
      setError('Failed to load foods. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLabel = (food) => {
    setSelectedFood(food);
    setShowLabelModal(true);
  };

  const handlePrintLabel = () => {
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    
    // Get the label content
    const labelContent = document.querySelector('.allergen-label-content');
    
    // Write the label HTML to the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Allergen Label - ${selectedFood.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .label-container { border: 4px solid black; padding: 20px; }
            .food-name { font-size: 28px; font-weight: bold; text-align: center; background: #f0f0f0; border: 2px solid black; padding: 20px; margin-bottom: 20px; }
            .warning { font-size: 12px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; }
            td { border: 2px solid #666; padding: 15px; text-align: center; }
            .emoji { font-size: 24px; }
            .label-text { font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="food-name">${selectedFood.name}</div>
            <p class="warning">
              Murray-Aikins Dining Hall is a tree nut/peanut free facility. This food item may contain the following allergens:
            </p>
            <table>
              <tr>
                <td class="emoji">${selectedFood.restrictions?.includes('Fish') ? '🐟' : '✗'}</td>
                <td class="label-text">Fish</td>
                <td class="emoji">${selectedFood.restrictions?.includes('Shellfish') ? '🦐' : '✗'}</td>
                <td class="label-text">Shellfish</td>
              </tr>
              <tr>
                <td class="emoji">${selectedFood.restrictions?.includes('Soy') ? '🫘' : '✗'}</td>
                <td class="label-text">Soy</td>
                <td class="emoji">${selectedFood.restrictions?.includes('Eggs') ? '🥚' : '✗'}</td>
                <td class="label-text">Eggs</td>
              </tr>
              <tr>
                <td class="emoji">${selectedFood.restrictions?.includes('Gluten') ? '🌾' : '✗'}</td>
                <td class="label-text">Gluten</td>
                <td class="emoji">${selectedFood.restrictions?.includes('Dairy') ? '🥛' : '✗'}</td>
                <td class="label-text">Dairy</td>
              </tr>
              <tr>
                <td class="emoji">${selectedFood.restrictions?.includes('Sesame') ? '🌰' : '✗'}</td>
                <td class="label-text">Sesame</td>
                <td class="emoji">${selectedFood.restrictions?.includes('Halal') ? '☪️' : '✗'}</td>
                <td class="label-text">Halal</td>
              </tr>
              <tr>
                <td class="emoji">${selectedFood.restrictions?.includes('Pork') ? '🐷' : '✗'}</td>
                <td class="label-text">Pork</td>
                <td class="emoji">${selectedFood.restrictions?.includes('Spicy') ? '🌶️' : '✗'}</td>
                <td class="label-text">Spicy</td>
              </tr>
              <tr>
                <td class="emoji">${selectedFood.restrictions?.includes('Vegetarian') ? '🥬' : '✗'}</td>
                <td class="label-text">Vegetarian</td>
                <td class="emoji">${selectedFood.restrictions?.includes('Vegan') ? '🌱' : '✗'}</td>
                <td class="label-text">Vegan</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleEdit = (food) => {
    setEditingId(food.id);
    setEditFormData({ ...food });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editFormData.name?.trim()) {
        alert('Food name is required');
        return;
      }

      // Update handleSaveEdit:
      const response = await fetch(`${API_BASE_URL}/foods?id=${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedFood = await response.json();
      setFoods(foods.map(f => f.id === editingId ? updatedFood : f));
      setEditingId(null);
      setEditFormData({});
      alert('Food item updated successfully!');
    } catch (error) {
      console.error('Failed to update food:', error);
      alert('Failed to update food item');
    }
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
  // Update handleDelete:
        const response = await fetch(`${API_BASE_URL}/foods?id=${foodId}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setFoods(foods.filter(f => f.id !== foodId));
        alert('Food item deleted successfully!');
      } catch (error) {
        console.error('Failed to delete food:', error);
        alert('Failed to delete food item');
      }
    }
  };

  const handleRestrictionToggle = (restriction) => {
    setEditFormData(prev => {
      const restrictions = prev.restrictions?.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...(prev.restrictions || []), restriction];
      return { ...prev, restrictions };
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  // Filter foods based on search
  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.ingredients.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading food items...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Food Items</h1>
          <button
            onClick={() => navigate('/admin/food/add')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold"
          >
            + Add New Food
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={fetchFoods}
              className="ml-4 underline font-semibold hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {filteredFoods.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No food items match your search.' : 'No food items found. Create one to get started!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredFoods.map(food => (
              <div key={food.id} className="bg-white rounded-lg shadow-md p-6">
                {editingId === food.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Ingredients</label>
                      <textarea
                        value={editFormData.ingredients || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, ingredients: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <span className="block text-gray-700 font-medium mb-2">Dietary Restrictions</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {allergens.map(restriction => (
                          <label key={restriction} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editFormData.restrictions?.includes(restriction) || false}
                              onChange={() => handleRestrictionToggle(restriction)}
                              className="mr-2 h-4 w-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-600">{restriction}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{food.name}</h3>
                      <p className="text-gray-600 mb-3">
                        <span className="font-semibold">Ingredients:</span> {food.ingredients}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {food.restrictions?.map(restriction => (
                          <span
                            key={restriction}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleGenerateLabel(food)}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md font-semibold text-sm"
                      >
                        🏷️ Label
                      </button>
                      <button
                        onClick={() => handleEdit(food)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allergen Label Modal */}
      {showLabelModal && selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Allergen Label</h2>
              <button
                onClick={() => setShowLabelModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Label Content */}
            <div className="border-4 border-gray-800 p-6">
              {/* Food Name - Bigger and Separate */}
              <div className="bg-gray-100 border-2 border-gray-800 p-6 mb-6 text-center">
                <h3 className="text-3xl font-bold text-gray-900">{selectedFood.name}</h3>
              </div>

              {/* Warning Text */}
              <p className="text-sm text-gray-700 mb-6">
                Murray-Aikins Dining Hall is a tree nut/peanut free facility. This food item may contain the following allergens:
              </p>

              {/* Allergen Grid */}
              <table className="w-full border-collapse">
                <tbody>
                  {/* Row 1: Fish & Shellfish */}
                  <tr>
                    <td className="border-2 border-gray-400 p-3 text-center w-1/6">
                      {selectedFood.restrictions?.includes('Fish') ? (
                        <span className="text-3xl">🐟</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center font-semibold">
                      Fish
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center w-1/6">
                      {selectedFood.restrictions?.includes('Shellfish') ? (
                        <span className="text-3xl">🦐</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center font-semibold">
                      Shellfish
                    </td>
                  </tr>

                  {/* Row 2: Soy & Eggs */}
                  <tr>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Soy') ? (
                        <span className="text-3xl">🫘</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className={`border-2 border-gray-400 p-3 text-center font-semibold ${selectedFood.restrictions?.includes('Soy') ? 'bg-yellow-50' : ''}`}>
                      Soy
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Eggs') ? (
                        <span className="text-3xl">🥚</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className={`border-2 border-gray-400 p-3 text-center font-semibold ${selectedFood.restrictions?.includes('Eggs') ? 'bg-orange-50' : ''}`}>
                      Eggs
                    </td>
                  </tr>

                  {/* Row 3: Gluten & Dairy */}
                  <tr>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Gluten') ? (
                        <span className="text-3xl">🌾</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className={`border-2 border-gray-400 p-3 text-center font-semibold ${selectedFood.restrictions?.includes('Gluten') ? 'bg-yellow-50' : ''}`}>
                      Gluten
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Dairy') ? (
                        <span className="text-3xl">🥛</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className={`border-2 border-gray-400 p-3 text-center font-semibold ${selectedFood.restrictions?.includes('Dairy') ? 'bg-blue-50' : ''}`}>
                      Dairy
                    </td>
                  </tr>

                  {/* Row 4: Sesame & Halal */}
                  <tr>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Sesame') ? (
                        <span className="text-3xl">🌰</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center font-semibold">
                      Sesame
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Halal') ? (
                        <span className="text-3xl">☪️</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center font-semibold">
                      Halal
                    </td>
                  </tr>

                  {/* Row 5: Pork & Spicy */}
                  <tr>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Pork') ? (
                        <span className="text-3xl">🐷</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center font-semibold">
                      Pork
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Spicy') ? (
                        <span className="text-3xl">🌶️</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center font-semibold">
                      Spicy
                    </td>
                  </tr>

                  {/* Row 6: Vegetarian & Vegan */}
                  <tr>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Vegetarian') ? (
                        <span className="text-3xl">🥬</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className={`border-2 border-gray-400 p-3 text-center font-semibold ${selectedFood.restrictions?.includes('Vegetarian') ? 'bg-green-100' : ''}`}>
                      Vegetarian
                    </td>
                    <td className="border-2 border-gray-400 p-3 text-center">
                      {selectedFood.restrictions?.includes('Vegan') ? (
                        <span className="text-3xl">🌱</span>
                      ) : (
                        <span className="text-3xl text-gray-300">X</span>
                      )}
                    </td>
                    <td className={`border-2 border-gray-400 p-3 text-center font-semibold ${selectedFood.restrictions?.includes('Vegan') ? 'bg-green-200' : ''}`}>
                      Vegan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handlePrintLabel}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold"
              >
                🖨️ Print Label
              </button>
              <button
                onClick={() => setShowLabelModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageFoods;