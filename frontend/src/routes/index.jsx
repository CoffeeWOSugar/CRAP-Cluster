import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Configure from '../pages/Configure';
import Home from '../pages/Home';
import Schedule from '../pages/Schedule';
import Result from '../pages/Result';
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configure" element={<Configure />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
};
export default AppRoutes;