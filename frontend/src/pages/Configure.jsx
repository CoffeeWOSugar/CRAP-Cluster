import React, { useState, useEffect } from 'react';
import "98.css";
import '../style.css';
import { handleAvailableIPs, handleNewNode, handleRemoveNode, handleConnectNodes} from '../features/server';
import useAnimatedDots from '../components/loadingAnimation';
import Popup from '../components/inputPopup';
import { useNavigate } from 'react-router-dom';


const Configure = () => {
  const navigate = useNavigate();
  const [ips, setIps] = useState([]);
  const [connectedIps, setConnectedIps] = useState([]);
  const [currentHost, setCurrentHost] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // optional: track loading

  const dots = useAnimatedDots(isConnecting);

  

  const fetchIPs = async () => {
    try {
      const { ips: allIps, connectedIps: connected, currentHost: host } = await handleAvailableIPs();
      setIps(allIps);
      setConnectedIps(connected);
      setCurrentHost(host);

    } catch (err) {
      console.error("Failed to load IPs:", err);
    }
  };

  useEffect(() => {
    fetchIPs();
  }, []);

  const handleAddPopupDone = async (data) => {

    // setIps(prev => [...prev, host]);
    await handleNewNode(data.username, data.host, data.pass);
    await fetchIPs();
    setShowAddPopup(false);
  };

  const handleRemovePopupDone = async (data) => {

    // setIps(prev => prev.filter(ip => ip !== host));
    // connectedIps.includes(host) && setConnectedIps(prev => prev.filter(ip => ip !== host));
    await handleRemoveNode(data.username, data.host);
    await fetchIPs();
    setShowRemovePopup(false);
 };

  const handleConnectClick = async () => {
    setIsConnecting(true);
    await handleConnectNodes();
    await fetchIPs();
    setIsConnecting(false);
  };

  return (
    <>
      {showAddPopup && (
        <div className ='modul-overlay'>
            <Popup
              includePass = {true}
              onClose={() => setShowAddPopup(false)}
              onDone={handleAddPopupDone}
              ips = {ips}
              manager = {currentHost}
            />
        </div>
      )}
      {showRemovePopup && (
        <div className ='modul-overlay'>
            <Popup
              includePass = {false}
              onClose={() => setShowRemovePopup(false)}
              onDone={handleRemovePopupDone}
              ips = {ips}
              manager = {currentHost}
            />
        </div>
      )}
      <div className='window'>
        <div className='title-bar'>
          <div className="title-bar-text">CRAP</div>
          <div className='title-bar-text'>Configure</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={() => window.electronAPI.close()} />
          </div>
        </div>

        <div className="window-body" style={{ textAlign: "left" }}>

          <h2>Configuration</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id sapien condimentum, blandit velit in, luctus magna. Vivamus at sapien eu ante ullamcorper finibus. Praesent finibus arcu elit, ac condimentum massa interdum in. Ut porttitor augue nunc, vehicula finibus purus auctor eget. Proin convallis tincidunt sem vel accumsan. Suspendisse suscipit urna quam, at efficitur erat mollis sit amet.</p>
          <div className="field-row-stacked" style={{ width: "400px", height: "150px", background: "white" }}>
            <table className="interactive" >
              <thead style={{ fontSize: "14px" }}>
                <tr>
                  <th>IP Address</th>
                  <th>Role</th>
                  <th style={{ width: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "14px" }}>
                {ips.map((ip, index) => {
                  const isConnected = connectedIps.includes(ip);
                  const isHost = currentHost && currentHost.trim() === ip.trim();
                  return (
                    <tr key={index}>
                      <td>{ip}</td>
                      <td>
                        {isConnected ? (isHost ? "Manager" : "Worker") : ""}
                      </td>
                      <td style={{ textAlign: "center", color: isConnected ? "green" : "red", }}>
                        {isConnected ? "✔" : "✖"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="field-row" style={{width: "400px"}}>
            <button className='basic-button' onClick={() => setShowAddPopup(true)}>Add node</button>
            <button className='basic-button' onClick={() => setShowRemovePopup(true)}>Remove Node</button>
            <button className='basic-button'
            onClick={handleConnectClick}
            style={{ marginLeft: "auto" }}
            disabled={isConnecting}
            >
              {isConnecting ? `Connecting${dots}` : 'Connect'}
            </button>
          </div>
          <div className="field-row" style={{width: "auto", height: "15%"}}>
            <button 
              className='basic-button'
              style={{marginright: "auto", marginTop: "auto"}}
              onClick={() => navigate('/')} 
              >
                Back
            </button>
            <button 
              className='basic-button'
              style={{marginLeft: "auto", marginTop: "auto"}}
              onClick={() => navigate('/schedule')} 
              >
                Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Configure;