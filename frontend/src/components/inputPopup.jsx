import React, { useState } from "react";
import "98.css";
import '../style.css';
import useAnimatedDots from "./loadingAnimation";
import { isValidSSH } from "../features/validators";


export default function Popup({ onDone, onClose, includePass, ips, manager}) {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const dots = useAnimatedDots(isConnecting);
  const [error, setError] = useState(null);

  const isDoneDisabled = includePass
    ? !name.trim() || !pass.trim()
    : !name.trim();

  const handleDone = async () => {
    if (isDoneDisabled) return;
    if(!isValidSSH(name)) {
      setError("Invalid SSH format.");
      return;
    }

    let username = 'villiam';
    let host = name;

    if (name.includes('@')) {
      const [u, h] = name.split('@');
      username = u || username;
      host = h || host;
    }

    if(ips && ips.includes(host) && includePass) {
      setError("Node already exists.");
      return;
    }

    if(ips && !ips.includes(host) && !includePass) {
      setError("Can't remove non-existing node.");
      return;
    }
    if(ips && host === manager && !includePass) {
      setError("Can't remove manager node.");
      return;
    }
    setError(null);
    setIsConnecting(true);
    try {
      await onDone({ username, host, pass });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="window popup">
      <div className="title-bar">
        <div className="title-bar-text">Enter Information</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>


      <div className="window-body" style={{ padding: "5px 35px 0px" }}>
        <div className="field-row-stacked">
          <label style = {{fontSize: "14px"}}>SSH name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }
            }
          />
          { name && error && (
            <span style={{ color: "red", fontSize: 12 }}>
              {error}
            </span>
          )}
        </div>

        {includePass && (<div className="field-row-stacked" style={{ marginTop: 8 }}>
          <label style = {{fontSize: "14px"}}>Password:</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>)}

        <div
          className="field-row"
          style={{ justifyContent: "center", marginTop: 16 }}
        >
          <button 
            className = "basic-button"
            onClick={onClose}>Exit</button>
          <button
            className = "basic-button"
            onClick={handleDone}
            disabled={isDoneDisabled || isConnecting}
            style={{ marginLeft: 6 }}
          >
              {isConnecting ? `Done${dots}` : 'Done'}
            
          </button>
        </div>
      </div>
    </div>
  );
}
