import React from 'react';
import "98.css";
import { useNavigate } from 'react-router-dom';
import '../style.css'
import AasciArt from '../components/AasciArt';
import handleConnect from '../features/server';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className='window'>
      <div className='title-bar'>
        <div className="title-bar-text">Counter</div>
        <div className='title-bar-text'>Home</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => window.electronAPI.close()} />
        </div>
      </div>

      <div className="window-body" style={{ textAlign: "left"}}>
        <AasciArt />
        <p>Welcome to the <strong>Circular Resource-limited Application Platform Cluster</strong>!</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id sapien condimentum, blandit velit in, luctus magna. Vivamus at sapien eu ante ullamcorper finibus. Praesent finibus arcu elit, ac condimentum massa interdum in. Ut porttitor augue nunc, vehicula finibus purus auctor eget. Proin convallis tincidunt sem vel accumsan. Suspendisse suscipit urna quam, at efficitur erat mollis sit amet.</p>
        <div className="field-row-stacked" style={{width: "200px"}}>
          <label htmlFor="textHost">Host</label>
          <input id="textHost" type="text" placeholder="e.g., 192.168.1.100"/>
        </div>
        <div className="field-row" style={{ justifyContent: "left", paddingTop: "20px" }}>
          <button onClick={handleConnect}>Connect</button>
          <button onClick={() => navigate('/configure')}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Home;