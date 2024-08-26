// src/components/ColorNamerTemplate.js
import React from 'react';
import './ColorNamerTemplate.css'; // Import specific CSS for the template if needed

const ColorNamerTemplate = ({ children }) => {
  return (
    <div className="template">
      <header className="header">
        <h1>Color Finder</h1>
      </header>
      <main className="main-content">
        <div className='container'>
          <div className="colorPickerSection">
            {children}
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>© 2024 Color Finder</p>
      </footer>
    </div>
  );
};

export default ColorNamerTemplate;
