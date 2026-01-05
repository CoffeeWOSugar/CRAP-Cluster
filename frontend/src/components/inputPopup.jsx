import React, { useState } from "react";
import "98.css";
import '../style.css';


export default function Popup({ onDone, onClose, includePass}) {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");

  const isDoneDisabled = !name.trim();
  if(includePass){
    const isDoneDisabled = !name.trim() || !pass.trim();
  }

  const handleDone = () => {
    if (!isDoneDisabled) {
      onDone({ name, pass });
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
            onChange={(e) => setName(e.target.value)}
          />
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
            disabled={isDoneDisabled}
            style={{ marginLeft: 6 }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
