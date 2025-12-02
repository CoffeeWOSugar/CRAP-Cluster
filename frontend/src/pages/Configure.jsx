import React from 'react';

const Configure = () => {
  return (
    <div className='window'>
      <div className='title-bar'>
        <div className="title-bar-text">Counter</div>
        <div className='title-bar-text'>Home</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => window.electronAPI.close()} />
        </div>
      </div>
      <h1>Configuration!</h1>
      <p>Welcome to the Configure page!</p>
    </div>
  );
};

export default Configure;