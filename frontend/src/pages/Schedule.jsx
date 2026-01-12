import "98.css";
import "../style.css";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';


const Schedule = () => {
  const [jobDirectory, setJobDirectory] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    directory: "",
    run: "",
  });
  const [flags, setFlags] = useState({
    gpu: null,
    cpuPower: null,
    memory: null,
    timeout:"1h",
    day: null,
    time: null,
    dom: null,
    cron: null
  });

  const openExplorer = async () => {
    const result = await window.electronAPI.openFileDialog();

    if (!result.canceled && result.filePaths.length > 0) {
      setJobDirectory(result.filePaths[0]);
      console.log("Selected directory:", result.filePaths[0]);
    }
  };

function dayNameToDow(day) {
  const map = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  return map[day.toLowerCase()] ?? null;
}

const toCron = (repeat) => {
  if (!flags.time || !repeat) return;

  const [hour, minute] = flags.time.split(":");

  let cron = "";

  switch (repeat) {
    case "hour":
      cron = `${minute} * * * *`;
      break;

    case "day":
      cron = `${minute} ${hour} * * *`;
      break;

    case "week":

      cron = `${minute} ${hour} * * ${dayNameToDow(flags.day)}`;
      break;

    case "month":
      cron = `${minute} ${hour} ${flags.dom} * *`;
      break;

    default:
      return;
  }

  setFlags(prev => ({
    ...prev,
    cron
  }));
};



  const updateFlag = (key, value) => {
    if (key === "day") {
      const date = new Date(value);
      setFlags(prev => ({
        ...prev,
        ["dom"]: date.getDate()
      }));
      value = date.toLocaleDateString("en-US", { weekday: "long" });

    }
    setFlags(prev => ({
      ...prev,
      [key]: value
    }));
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
      console.log("flags: ", flags)

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
                value={flags.gpu}
                onChange={(e) => updateFlag("gpu", e.target.value)}
                style={{ width: "100%" }}
              >
                <option value={null}>Unspecified</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px" }}>
                CPU Power
              </label>
              <select
                value={flags.cpuPower}
                onChange={(e) => updateFlag("cpuPower", e.target.value)}
                style={{ width: "100%" }}
              >
                <option value={null}>Unspecified</option>
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
                value={flags.memory}
                onChange={(e) => updateFlag("memory", e.target.value)}
                style={{ width: "100%" }}
              >
                <option value={null}>Unspecified</option>
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
                  onChange={(e) => updateFlag("timeout", e.target.value)}
                />

                <select 
                  style={{ width: "80px", fontSize: "14px" }} 
                  defaultValue="h"
                  onChange={(e) => updateFlag("timeout",  flags.timeout + e.target.value)}
                >
                  <option value="s">sec</option>
                  <option value="m">min</option>
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
                <input 
                  type="date"
                  onChange={(e)=>updateFlag("day", e.target.value)} />

                <label>Time</label>
                <input 
                  type="time" 
                  onChange = {(e)=>updateFlag("time", e.target.value)}
                  />
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

                <select 
                  onChange={(e) => {
                    toCron(e.target.value);
                    }}>
                  <option value = {null}></option>
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
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
