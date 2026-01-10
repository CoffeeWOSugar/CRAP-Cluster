import "98.css";
import "../style.css";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';


const Schedule = () => {
  const [jobDirectory, setJobDirectory] = useState("");
  const navigate = useNavigate();
  const [gpu, setGpu] = useState("unspecified");
  const [cpuPower, setCpuPower] = useState("unspecified");
  const [memory, setMemory] = useState("unspecified");
  const [errors, setErrors] = useState({
    directory: "",
    run: "",
  });

  const openExplorer = async () => {
    const result = await window.electronAPI.openFileDialog();

    if (!result.canceled && result.filePaths.length > 0) {
      setJobDirectory(result.filePaths[0]);
      console.log("Selected directory:", result.filePaths[0]);
    }
  };

  const handleSubmit = () => {
    let newErrors = { directory: "", run: "" };
    let hasError = false;

    if (!jobDirectory) {
      newErrors.directory = "Please select a directory.";
      hasError = true;
    }

    const runDateInput = document.querySelector('input[type="date"]');
    const runTimeInput = document.querySelector('input[type="time"]');
    if (!runDateInput.value || !runTimeInput.value) {
      newErrors.run = "Please select a date and time for the run.";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      // All good — later you can trigger backend call
      //TODO: submit job to backend

    }
  };


  return (
    <div className="window">
      <div className="title-bar">
        <div className="title-bar-text">CRAP</div>
        <div className="title-bar-text">Schedule</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => window.electronAPI.close()} />
        </div>
      </div>

      <div className="window-body" style={{ textAlign: "left" }}>
        <h2>Scheduling</h2>

        <p> To schedule a job, please specify the job directory, required resources, and timing options below.</p>

        {/* Directory picker */}
        <div className="field-row">
          <input
            style={{ fontSize: "14px", height: "24px", width: "200px" }}
            type="text"
            value={jobDirectory}
            readOnly
          />
          <button className="basic-button" onClick={openExplorer}>
            Browse
          </button>
        </div>
        {errors.directory && (
          <div style={{ color: "red", marginLeft: "4px", fontSize: "12px" }}>
            {errors.directory}
          </div>
        )}

        {/* Dropdowns */}
        <fieldset style={{ marginTop: "16px" }}>
          <legend>Resources</legend>

          <div
            className="field-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>GPU</label>
              <select
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="unspecified">Unspecified</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>
                CPU Power
              </label>
              <select
                value={cpuPower}
                onChange={(e) => setCpuPower(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="unspecified">Unspecified</option>
                <option value="small">Small</option>
                <option value="med">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">XLarge</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>
                Memory
              </label>
              <select
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="unspecified">Unspecified</option>
                <option value="small">Small</option>
                <option value="med">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">XLarge</option>
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset style={{ marginTop: "16px" }}>
          <legend style={{ fontSize: "14px" }}>Schedule</legend>

          <div style={{ fontSize: "14px" }}>
            {/* Timeout */}
            <div style={{ marginBottom: "8px" }}>
              <label>
                Timeout
              </label>

              <div
                className="field-row"
                style={{ marginLeft: "20px", marginTop: "4px", alignItems: "center", gap: "4px" }}
              >
                <label>After</label>

                <input
                  type="number"
                  min="0"
                  defaultValue={1}            // default to 1
                  style={{ width: "80px", fontSize: "14px" }}
                />

                <select style={{ width: "80px", fontSize: "14px" }} defaultValue="h">
                  <option value="sec">sec</option>
                  <option value="min">min</option>
                  <option value="h">h</option>
                </select>
              </div>
            </div>

            {/* Run once */}
            <div style={{ marginBottom: "8px" }}>
              <label>
                Run
              </label>

              <div className="field-row" style={{ marginLeft: "20px", marginTop: "4px" }}>
                <label>Date</label>
                <input type="date" />

                <label>Time</label>
                <input type="time" />
              </div>
              {errors.run && (
                <div style={{ color: "red", marginLeft: "20px", fontSize: "12px" }}>
                  {errors.run}
                </div>
              )}
            </div>

            {/* Repeat */}
            <div>
              <label>
                Repeat
              </label>

              <div className="field-row" style={{ marginLeft: "20px", marginTop: "4px" }}>
                <label>Every</label>
                {/* <input type="date"  /> */}

                <select>
                  <option>-</option>
                  <option>hour</option>
                  <option>Day</option>
                  <option>Week</option>
                  <option>Month</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>
        <div className="field-row" style={{ justifyContent: "right", paddingTop: "20px" }}>
            <button 
              className='basic-button'
              style={{marginright: "auto", marginTop: "auto"}}
              onClick={() => navigate('/configure')} 
              >
                Back
            </button>
            <button 
              className='basic-button'
              style={{ marginRight: "auto",marginTop: "auto"}}
              onClick={() => navigate('/configure')} 
              >
                Next
            </button>

          <button className='basic-button' onClick={handleSubmit}>
            Submit job
          </button>
        </div>



      </div>
    </div>
  );
};

export default Schedule;
