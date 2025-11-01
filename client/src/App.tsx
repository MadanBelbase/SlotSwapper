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
        <Route path="/SlotSwapper/" element={<Home />} />
        <Route path="/SlotSwapper/login" element={<Login />} />
        <Route path="/SlotSwapper/signup" element={<Signup />} />
        <Route path="/SlotSwapper/dashboard" element={<Dashboard />} />
        <Route path="/SlotSwapper/create-slot" element={<CreateSlot />} />
        <Route path="/SlotSwapper/my-slots" element={<MySlot />} />
        {/* Correct dynamic route syntax */}
        <Route path="/SlotSwapper/slot/:slotId" element={<SlotDetails />} />
        <Route path="/SlotSwapper/swap/:slotId" element={<SwapPage />} />

       <Route path="/SlotSwapper/your-swaps" element={<SwapManagementPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;


