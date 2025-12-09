import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Configure from '../pages/Configure';
import Home from '../pages/Home';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/configure" element={<Configure />} />
      </Routes>
    </Router>
  );
};
export default AppRoutes;