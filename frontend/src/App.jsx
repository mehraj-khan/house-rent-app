import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddHouse from './pages/AddHouse';
import HouseDetails from './pages/HouseDetails';
import Dashboard from './pages/Dashboard';
import EditHouse from './pages/EditHouse';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Roommates from './pages/Roommates';
import BillCalculator from './pages/BillCalculator';
import Offers from './pages/Offers';
import ForgotPassword from './pages/ForgotPassword';
import InstallAppBanner from './components/InstallAppBanner';
import PostTenantRequest from './pages/PostTenantRequest';
import TenantRequestsFeed from './pages/TenantRequestsFeed';
import Advertise from './pages/Advertise';
import axios from 'axios';
import Footer from './components/Footer';

// ہر API کال کے ساتھ خودکار JWT Token بھیجنے کے لیے (Cloudinary کو متاثر کیے بغیر)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const url = config.url || '';
  const isMyApi =
    url.includes('localhost:5000') ||
    url.includes('house-rent-app-ten.vercel.app') ||
    url.startsWith('/api');

  if (token && token !== 'null' && token !== 'undefined' && isMyApi) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home defaultPurpose="rent" />} />
        <Route path="/buy" element={<Home defaultPurpose="sale" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-house" element={<AddHouse />} />
        <Route path="/house/:id" element={<HouseDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-house/:id" element={<EditHouse />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/roommates" element={<Roommates />} />
        <Route path="/bill-calculator" element={<BillCalculator />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/wanted" element={<TenantRequestsFeed />} />
        <Route path="/post-request" element={<PostTenantRequest />} />
        <Route path="/advertise" element={<Advertise />} />
      </Routes>
      <Footer />
      <InstallAppBanner />
    </AuthProvider>
  );
}

export default App;