import React, { useState } from 'react';
import '../../styles/Sidebar.css';

function UserSidebar({
  stations,
  selectedStations,
  onToggleStation,
  timePeriods,
  selectedTimes,
  onToggleTime,
  excludeAllergens,
  selectedExclude,
  onToggleExclude,
  preferences,
  selectedPreferences,
  onTogglePreference,
  onCollapse,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapse) {
      onCollapse(newCollapsedState);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`sidebar-toggle ${isCollapsed ? 'collapsed' : 'expanded'}`}
        onClick={toggleSidebar}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="toggle-icon">
          {isCollapsed ? '»' : '«'}
        </span>
      </button>

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <span className="text">Filters</span>
            </h2>
          </div>

          {/* Stations */}
          <div className="filter-section">
            <h3 className="section-title">
              <span className="text">Stations</span>
            </h3>
            <div className="filter-options">
              {stations.map((station) => (
                <label key={station} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedStations.includes(station)}
                    onChange={() => onToggleStation(station)}
                    className="filter-checkbox"
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">{station}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Periods */}
          <div className="filter-section">
            <h3 className="section-title">
              <span className="text">Time Periods</span>
            </h3>
            <div className="filter-options">
              {timePeriods.map((time) => (
                <label key={time} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedTimes.includes(time)}
                    onChange={() => onToggleTime(time)}
                    className="filter-checkbox"
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">{time}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Exclude Allergens */}
          <div className="filter-section">
            <h3 className="section-title">
              <span className="text">Exclude Allergens</span>
            </h3>
            <div className="filter-options">
              {excludeAllergens.map((allergen) => (
                <label key={allergen} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedExclude.includes(allergen)}
                    onChange={() => onToggleExclude(allergen)}
                    className="filter-checkbox filter-checkbox-exclude"
                  />
                  <span className="checkmark checkmark-exclude"></span>
                  <span className="label-text">{allergen}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="filter-section">
            <h3 className="section-title">
              <span className="text">Dietary Preferences</span>
            </h3>
            <div className="filter-options">
              {preferences.map((pref) => (
                <label key={pref} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedPreferences.includes(pref)}
                    onChange={() => onTogglePreference(pref)}
                    className="filter-checkbox"
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">{pref}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear All Button */}
          <div className="sidebar-footer">
            <button 
              className="clear-button"
              onClick={() => {
                selectedStations.forEach(s => onToggleStation(s));
                selectedTimes.forEach(t => onToggleTime(t));
                selectedExclude.forEach(e => onToggleExclude(e));
                selectedPreferences.forEach(p => onTogglePreference(p));
              }}
              disabled={
                selectedStations.length === 0 && 
                selectedTimes.length === 0 && 
                selectedExclude.length === 0 && 
                selectedPreferences.length === 0
              }
            >
              <span className="text">Clear All Filters</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default UserSidebar;