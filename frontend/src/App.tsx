import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FlightsPage from './pages/FlightsPage';
import SeatsPage from './pages/SeatsPage';
import BookingPage from './pages/BookingPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import LegalPage from './pages/LegalPage';

function AppShell() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="air-app">
      <Header />
      <div className="air-shell">
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/flights/:id/seats" element={<SeatsPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/legal" element={<LegalPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
