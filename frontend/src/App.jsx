import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddHouse from './pages/AddHouse';
import HouseDetails from './pages/HouseDetails';
import Dashboard from './pages/Dashboard';
import EditHouse from './pages/EditHouse';
import AdminDashboard from './pages/AdminDashboard'; // 👈 ایڈمن پیج
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-house" element={<AddHouse />} />
        <Route path="/house/:id" element={<HouseDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-house/:id" element={<EditHouse />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* 👈 ایڈمن کا راستہ */}
      </Routes>
    </AuthProvider>
  );
}

export default App;