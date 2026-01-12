import React, { useState, useEffect } from 'react';

import "98.css";
import { useNavigate } from 'react-router-dom';
import '../style.css';
import AasciArt from '../components/AasciArt';
import {handleConnect} from '../features/server';
import useAnimatedDots from '../components/loadingAnimation';
import { isValidSSH } from '../features/validators';

const Home = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false); // track SSH status
  const [isConnecting, setIsConnecting] = useState(false); // optional: track loading
  const [resultMsg, setResultMsg] = useState("")
  const dots = useAnimatedDots(isConnecting);

 const handleConnectClick = async () => {
  setIsConnecting(true);
  setIsConnected(null);        
  setResultMsg("");
  const inputEl = document.getElementById('textHost');
  if (!inputEl) {
    setResultMsg("Hostname input not found!");
    setIsConnecting(false);
    return;
  }
  const input = inputEl.value;
  if (isValidSSH(input) === false) {
    console.log("Connecting to:", input);
    setResultMsg("Invalid SSH format.");
    setIsConnected(false);
    setIsConnecting(false);
    return;
  }

  try {
    const result = await handleConnect(input); // pass input explicitly
    setIsConnected(true);
    setResultMsg("Connection successful!");
  } catch (err) {
    setIsConnected(false);
    setResultMsg("Connection failed!");
  } finally {
    setIsConnecting(false);
  }
};

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
        <AasciArt />
        <p>Welcome to the <strong>Circular Resource-limited Application Platform</strong> Cluster!</p>
        {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id sapien condimentum, blandit velit in, luctus magna. Vivamus at sapien eu ante ullamcorper finibus. Praesent finibus arcu elit, ac condimentum massa interdum in. Ut porttitor augue nunc, vehicula finibus purus auctor eget. Proin convallis tincidunt sem vel accumsan. Suspendisse suscipit urna quam, at efficitur erat mollis sit amet.</p> */}
        <p>Welcome to the Circular Resource-limited Application Platform Cluster GUI! This GUI enables simple and efficient setup of your CRAP cluster while also providing a scheduling and monitoring tools. <br/>
         To get started, please make a SSH key exchange with your intended manager node and connect to it below and proceed to next page when ready
        </p>
        <div className="field-row-stacked" style={{width: "200px"}}>
          <label style={{fontSize: "14px"}} htmlFor="textHost">Hostname</label>
          <input style={{fontSize: "14px", height: "24px", width: "200px"}} id="textHost" type="text" placeholder="e.g., user@127.0.0.1"/>
        </div>
        {isConnected !== null && (
          <p style={{
            fontSize: "12px",
            marginTop: "10px",
            color: isConnected ? "green" : "red",
          }}>
            {resultMsg}
          </p>
        )}
        <div className="field-row" style={{ justifyContent: "left", paddingTop: "20px" }}>
          <button className='basic-button' 
            onClick={handleConnectClick} 
            disabled={isConnecting}
          >
            {/* {isConnecting ? 'Connecting...' : 'Connect'} */}
            {isConnecting ? `Connecting${dots}` : 'Connect'}
          </button>

          <button className='basic-button'
            onClick={() => navigate('/configure')} 
            disabled={!isConnected} // disable until SSH succeeds
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;