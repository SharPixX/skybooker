import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import FlightsPage from './pages/FlightsPage';
import SeatsPage from './pages/SeatsPage';
import BookingPage from './pages/BookingPage';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import LegalPage from './pages/LegalPage';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-dark-900 text-fg-secondary flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/flights" element={<FlightsPage />} />
                <Route path="/flights/:id/seats" element={<SeatsPage />} />
                <Route path="/booking/:id" element={<BookingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/legal" element={<LegalPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
