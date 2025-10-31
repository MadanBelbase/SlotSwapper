import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateSlot from './pages/CreateSlot';
import MySlot from './pages/MySlots';
import { Footer } from './components/Footer';
import SlotDetails from './pages/SlotDetails';
import SwapPage from './pages/SwapPage';
import SwapManagementPage from './pages/SwapManagementPage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-slot" element={<CreateSlot />} />
        <Route path="/my-slots" element={<MySlot />} />
        {/* Correct dynamic route syntax */}
        <Route path="/slot/:slotId" element={<SlotDetails />} />
        <Route path="/swap/:slotId" element={<SwapPage />} />

<Route path="/your-swaps" element={<SwapManagementPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;


