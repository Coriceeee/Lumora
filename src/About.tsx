import React, { useState } from 'react';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTab = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <ul className="menu menu-gray-600 menu-hover-primary fw-bold order-1">
        <li className="menu-item">
          <a href="#" className="menu-link ps-0 pe-2" onClick={toggleTab}>
            About
          </a>
        </li>
      </ul>

      {isOpen && (
        <div className="tab-popup">
          <div className="tab-content">
            <h2>About Us</h2>
            <p>
              Lumora is a comprehensive AI-powered educational platform designed to help students understand themselves, study more effectively, and chart their career path with confidence and inspiration.
            </p>
            <button className="close-tab" onClick={toggleTab}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
