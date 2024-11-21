import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
};

const Home = () => {
  return (
    <div>
      <h1>Welcome to 8192 Turn-Based Game!</h1>
      <p>The frontend is up and running!</p>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
