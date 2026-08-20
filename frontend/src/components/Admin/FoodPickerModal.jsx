import React, { useState, useEffect } from 'react';

function FoodPickerModal({ onClose, onAddFood, existing, foodList, day, meal, station }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Close on ESC key
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Filter foods based on search term and exclude those already selected
  const filteredFoods = foodList
    .filter(f => !existing.includes(f.id))
    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  // Add all selected foods and close modal
  const handleAddSelected = () => {
    selectedIds.forEach(id => onAddFood(id));
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          &times;
        </button>

        {/* Title */}
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          Add food to <span className="text-blue-700">{station}</span> for{' '}
          <span className="text-indigo-600">{meal}</span> on{' '}
          <span className="text-blue-700">{day}</span>
        </h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search food..."
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          autoFocus
        />

        {/* Food list */}

        {filteredFoods.length === 0 ? (
          <p className="text-center text-gray-500 select-none">No foods match your search.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto">
            {filteredFoods.map(food => (
              <li
                key={food.id}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50 rounded select-none"
                onClick={() => toggleSelect(food.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') toggleSelect(food.id);
                }}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedIds.has(food.id)}
                aria-label={`Select ${food.name}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(food.id)}
                  onChange={() => toggleSelect(food.id)}
                  className="mr-3 cursor-pointer"
                  onClick={e => e.stopPropagation()} // prevent li click toggling twice
                />
                <span>{food.name}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedIds.size === 0}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            Add Selected ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodPickerModal;