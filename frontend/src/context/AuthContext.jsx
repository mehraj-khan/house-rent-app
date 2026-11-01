/* eslint-disable */
import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('houseRentUser')) || null
  );
  const [lang, setLang] = useState(localStorage.getItem('houseRentLang') || 'en');

  const login = (userData, token) => {
    localStorage.setItem('houseRentUser', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('houseRentUser');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    localStorage.setItem('houseRentLang', nextLang);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, lang, toggleLanguage }}>
      <div dir={lang === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);