import React, { useState, useEffect } from 'react';
import "98.css";
import '../style.css';
import { handleAvailableJobs, handleJobResult} from '../features/server';
import useAnimatedDots from '../components/loadingAnimation';
import Popup from '../components/inputPopup';
import { useNavigate } from 'react-router-dom';


const Result = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dots = useAnimatedDots(isLoading);
  // Regex to match "job_" followed by numbers
  const jobPattern = /^job-\d*$/;


  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const availableJobs = await handleAvailableJobs();
      setJobs(availableJobs);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);




  const handleChange = (e) =>{
   
    // Allow empty string or valid pattern
    // if (e.target.value === "" || jobPattern.test(e.target.value)) {
    setJobId(e.target.value);
    setErrorMsg(null);
    // }
  };

  const handleClick = () => {
    
    if (jobPattern.test(jobId)) {
      handleJobResult(jobId);
      fetchJobs();
    } else {
      setErrorMsg("Invalid job ID format. Use 'job-<number>'.");
    }
  };



  return (


    <div className='window'>
      <div className='title-bar'>
        <div className="title-bar-text">CRAP</div>
        <div className='title-bar-text'>Configure</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => window.electronAPI.close()} />
        </div>
      </div>

      <div className="window-body" style={{ textAlign: "left" }}>

        <h2>Result</h2>
        <p>Down below you can see jobs that has finished execution and there status. <br/>To download the result, please enter the id of the Job that you want to see. The result will be stored in CRAP-Cluster/frontend/downloads </p>
        <div
          className="field-row-stacked"
          style={{
            width: "400px",
            height: "150px",
            background: "white",
            overflowY: "auto",
          }}
        >
          <table
            className="interactive"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead
              style={{
                fontSize: "14px",
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 1,
              }}
            >
              <tr>
                <th>Job</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "14px" }}>
              {jobs.map((job, index) => (
                <tr key={index}>
                  <td>{job.jobid}</td>
                  <td>{job.date} {job.time}</td>
                  <td>{job.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="field-row" style={{ width: "400px" }}>
          <input
            type="text"
            placeholder="e.g. job-110"
            value={jobId}
            onChange={handleChange}
            // style={{ flex: 1, padding: "6px" }}
          />
          <button className="basic-button" onClick={handleClick}>
            {isLoading ? `Fetching${dots}` : 'Fetch Result'}
          </button>
          <button className="basic-button" onClick={fetchJobs}>
            Update
          </button>
        </div>
        {errorMsg && (
          <p style={{ color: "red", fontSize: "14px" }}>{errorMsg}</p>
        )}
      </div>
    </div>
  );
};

export default Result;