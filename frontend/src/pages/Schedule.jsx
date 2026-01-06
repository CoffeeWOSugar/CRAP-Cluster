import "98.css";
import '../style.css';
import { useState } from "react";


const Schedule = () => {
    const [jobDirectory, setJobDirectory] = useState("");

    const openExplorer = async () => {
        const result = await window.electronAPI.openFileDialog();

        const directoryPath = result.filePaths[0];
        if (!result.canceled) {
            setJobDirectory(directoryPath);
            console.log("Selected directory:", directoryPath);
        }
    };


  return (

      <div className='window'>
        <div className='title-bar'>
          <div className="title-bar-text">CRAP</div>
          <div className='title-bar-text'>Schedule</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={() => window.electronAPI.close()} />
          </div>
        </div>

        <div className="window-body" style={{ textAlign: "left" }}>

            <h2>Scheduling</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id sapien condimentum, blandit velit in, luctus magna. Vivamus at sapien eu ante ullamcorper finibus. Praesent finibus arcu elit, ac condimentum massa interdum in. Ut porttitor augue nunc, vehicula finibus purus auctor eget. Proin convallis tincidunt sem vel accumsan. Suspendisse suscipit urna quam, at efficitur erat mollis sit amet.</p>
            <button className='basic-button' onClick={openExplorer}>Browse</button>
        </div>
      </div>
  );
};

export default Schedule;