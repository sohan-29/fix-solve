import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Round1 from './pages/Round1';
import Round2 from './pages/Round2';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/round1" element={<Round1 />} />
        <Route path="/round2" element={<Round2 />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
