import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import '../../styles/HoursPage.css';

function HoursPage() {
  const navigate = useNavigate();
  const [hours, setHours] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/hours`);
        if (response.ok) {
          const data = await response.json();
          setHours(data.days || []);
          setStations(data.stations || []);
        }
      } catch (err) {
        console.error('Error fetching hours:', err);
        // Keep empty arrays on error
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  if (loading) {
    return (
      <div className="hours-page-container">
        <div className="hours-page">
          <p className="text-center text-gray-600">Loading hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hours-page-container">
      <div className="hours-page">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Menu
        </button>

        <h1 className="hours-title">Dining Hours</h1>

        {/* Daily Hours */}
        <section className="hours-section">
          <h2 className="hours-section-title">Daily Hours</h2>
          <div className="hours-grid">
            {hours.map((day, index) => (
              <div key={index} className="hours-card">
                <h3 className="day-name">{day.day}</h3>
                <div className="meal-times">
                  {day.breakfast && (
                  <div className="meal">
                    <span className="meal-label">Breakfast</span>
                    <span className="meal-time">{day.breakfast}</span>
                  </div>
                  )}
                  {day.lunch && (
                  <div className="meal">
                    <span className="meal-label">Lunch</span>
                    <span className="meal-time">{day.lunch}</span>
                  </div>
                  )}
                  {day.dinner && (
                  <div className="meal">
                    <span className="meal-label">Dinner</span>
                    <span className="meal-time">{day.dinner}</span>
                  </div>
                  )}
                  {day.late_night && (
                    <div className="meal">
                      <span className="meal-label">Late Night</span>
                      <span className="meal-time">{day.late_night}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Station Hours */}
        <section className="hours-section">
          <h2 className="hours-section-title">Station Hours</h2>
          <div className="stations-grid">
            {stations.map((station, index) => (
              <div key={index} className="station-card">
                <h3 className="station-name">{station.name}</h3>
                <p className="station-hours">{station.hours}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HoursPage;