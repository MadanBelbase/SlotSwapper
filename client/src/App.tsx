import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateSlot from './pages/CreateSlot';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
         <Route path = "/dashboard" element= {<Dashboard  /> } />
          <Route path = "/create-slot" element= {<CreateSlot  /> } />
        
      </Routes>
    </Router>
  );
}

export default App;

