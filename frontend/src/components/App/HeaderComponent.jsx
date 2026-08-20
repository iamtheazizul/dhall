import React from 'react';
import '../../styles/HeaderComponent.css';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function HeaderComponent() {
  const navigate = useNavigate();
  
  return (
    <div className="header-container">
      <div className="header-logo">
        <img src={logo} alt="Skidmore Dining" className="logo-image" />
      </div>
      <h1 className="header-title">Today's Menu</h1>
      <div className="header-buttons">
        <button 
          className="header-button" 
          onClick={() => navigate('/hours')}
        >
          Hours
        </button>
      </div>
    </div>
  );
}

export default HeaderComponent;