import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import PriceHistoryPage from './pages/PriceHistoryPage';
import SavingsReportPage from './pages/SavingsReportPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/price-history" element={<PriceHistoryPage />} />
        <Route path="/savings-reports" element={<SavingsReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
