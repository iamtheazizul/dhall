import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/MenuGrid.css';

const dietaryIcons = {
  'Vegetarian': '🥬',
  'Vegan': '🌱',
  'Gluten': '🌾',
  'Dairy': '🥛',
  'Eggs': '🥚',
  'Fish': '🐟',
  'Shellfish': '🦐',
  'Soy': '🫘',
  'Sesame': '🌰',
  'Halal': '☪️',
  'Pork': '🐷',
  'Spicy': '🌶️'
};

function MenuGrid({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredRestriction, setHoveredRestriction] = useState(null);

  const handleCardClick = (item) => setSelectedItem(item);

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) setSelectedItem(null);
  };

  if (items.length === 0) {
    return <p>No menu items match your filters.</p>;
  }

  // 1. PORTAL DEFINED HERE (before the return)
  const modal = selectedItem && ReactDOM.createPortal(
    <div
      className="menu-grid-modal-background open"
      onClick={handleCloseModal}
    >
      <div className="menu-grid-modal-content open">
        <button
          className="menu-grid-modal-button"
          onClick={() => setSelectedItem(null)}
          aria-label="Close modal"
        >
          &times;
        </button>
        <div className="modal-header">
          <h2 className="modal-title">{selectedItem.name}</h2>
        </div>
        <div className="modal-body">
          {selectedItem.allergens && selectedItem.allergens.length > 0 && (
            <div className="modal-allergens">
              <strong>Dietary Info:</strong>
              <div className="allergen-tags-modal">
                {selectedItem.allergens.map(allergen => (
                  <span
                    key={allergen}
                    className="allergen-tag-icon"
                    onMouseEnter={() => setHoveredRestriction(allergen)}
                    onMouseLeave={() => setHoveredRestriction(null)}
                  >
                    <span className="icon-large">{dietaryIcons[allergen] || '🏷️'}</span>
                    {hoveredRestriction === allergen && (
                      <span className="icon-tooltip">{allergen}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <div className="modal-station">
            <span className="footer-label">Station</span>
            <span className="footer-value">{selectedItem.station}</span>
          </div>
          <div className="modal-time">
            <span className="footer-label">Available</span>
            <span className="footer-value">{selectedItem.timePeriods.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  // 2. RETURN WITH {modal} AT THE BOTTOM
  return (
    <>
      <div className="menu-grid">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            onClick={() => handleCardClick(item)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick(item)}
            role="button"
            tabIndex={0}
            className="menu-grid-item"
          >
            <div className="card-header">
              <h4 className="card-title">{item.name}</h4>
            </div>
            <div className="card-footer">
              <span className="card-time">{item.timePeriods.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>

      {modal}  {/* 3. USED HERE, inside the return but outside the cards div */}
    </>
  );
}

export default MenuGrid;