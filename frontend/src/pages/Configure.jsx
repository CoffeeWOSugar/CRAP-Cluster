import React, { useState, useEffect } from 'react';

import "98.css";
import { useNavigate } from 'react-router-dom';
import '../style.css';
import AasciArt from '../components/AasciArt';
import handleConnect from '../features/server';

const Configure = () => {
  return (
    <div className='window'>
      <div className='title-bar'>
        <div className="title-bar-text">CRAP</div>
        <div className='title-bar-text'>Home</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => window.electronAPI.close()} />
        </div>
      </div>

      <div className="window-body" style={{ textAlign: "left"}}>
        <h2>Configuration</h2>
        <table className="interactive"> 
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>Company</th>
            </tr>
          </thead>
        </table>


      </div>
    </div>
  );
};

export default Configure;