import React, { useState } from "react";
import "98.css";
import '../style.css';


export default function Popup({ onDone, onClose }) {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  const isDoneDisabled = !input1.trim() || !input2.trim();

  const handleDone = () => {
    if (!isDoneDisabled) {
      onDone({ input1, input2 });
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

      <div className="window-body">
        <div className="field-row-stacked">
          <label>First Input</label>
          <input
            type="text"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
        </div>

        <div className="field-row-stacked" style={{ marginTop: 8 }}>
          <label>Second Input</label>
          <input
            type="text"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
          />
        </div>

        <div
          className="field-row"
          style={{ justifyContent: "flex-end", marginTop: 16 }}
        >
          <button onClick={onClose}>Exit</button>
          <button
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
