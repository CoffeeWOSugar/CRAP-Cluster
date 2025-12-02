import React from 'react';
import "98.css";
import '../style.css'

const Home = () => {
  return (
    <div className='window'>
      <div className='title-bar'>
        <div className="title-bar-text">Counter</div>
        <div className='title-bar-text'>Home</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => window.electronAPI.close()} />
        </div>
      </div>

      <div className="window-body">
        <h1>Welcome!</h1>
        <p>Welcome to the Home page!</p>
        {/* <div className="field-row" style={{ justifyContent: "center" }}> */}
          {/* <button onClick={}>Start</button> */}

        {/* </div> */}
      </div>
    </div>
  );
};

export default Home;