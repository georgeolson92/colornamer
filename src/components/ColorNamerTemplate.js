import React from "react";
import "./ColorNamerTemplate.css";

const ColorNamerTemplate = ({ children }) => {
  return (
    <div className="template">
      <header className="header">
        <h1>Color Finder</h1>
      </header>
      <main className="main-content">
        <div className="container">
          <div className="colorPickerSection">{children}</div>
        </div>
      </main>
      <footer className="footer">
        © 2024 Color Finder
      </footer>
    </div>
  );
};

export default ColorNamerTemplate;
