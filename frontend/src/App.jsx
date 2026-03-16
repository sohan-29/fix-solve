import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import Round1 from './pages/Round1';
import Round2 from './pages/Round2';
import RoundCompletion from './pages/RoundCompletion';
import Results from './pages/Results';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/round1" element={<ProtectedRoute allowedRound={1}><Round1 /></ProtectedRoute>} />
        <Route path="/round2" element={<ProtectedRoute allowedRound={2}><Round2 /></ProtectedRoute>} />
        <Route path="/round-complete" element={<RoundCompletion />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
