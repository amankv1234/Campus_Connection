import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Discovery from './pages/Discovery';
import Chat from './pages/Chat';
import Opportunities from './pages/Opportunities';
import Groups from './pages/Groups';
import Events from './pages/Events';
import Leaderboard from './pages/Leaderboard';
import AIAssistant from './pages/AIAssistant';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/discovery" element={<PrivateRoute><Discovery /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/opportunities" element={<PrivateRoute><Opportunities /></PrivateRoute>} />
            <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
            <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            <Route path="/ai" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
