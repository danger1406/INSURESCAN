import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from './context/ThemeContext';
import Hero from './components/Hero';
import FileUpload from './components/FileUpload';
import LoadingState from './components/LoadingState';
import ResultsDashboard from './components/ResultsDashboard';
import './index.css';

// Backend API URL
// In production (Vercel), API is at /api
// In development, API is at localhost:5000
const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/api');

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [state, setState] = useState('idle'); // idle, loading, results, error
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file, isDemoMode) => {
    setState('loading');
    setError(null);

    try {
      const formData = new FormData();
      
      if (isDemoMode || !file) {
        formData.append('demo_mode', 'true');
      } else {
        formData.append('file', file);
      }

      const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setResults(response.data);
      setState('results');
    } catch (err) {
      console.error('Analysis error:', err);
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        console.log('Backend unavailable, using mock data');
        setResults(getMockResults());
        setState('results');
        return;
      }

      setError(err.response?.data?.error || err.message || 'An unexpected error occurred');
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResults(null);
    setError(null);
  };

  const getMockResults = () => ({
    safety_score: 65,
    summary: "This is a standard health policy with comprehensive hospital coverage but has strict limits on room rent and waiting periods for pre-existing conditions.",
    red_flags: [
      "Room Rent capped at ₹5,000/day or 1% of Sum Insured",
      "4-year waiting period for pre-existing diseases",
      "20% co-payment for claims above ₹2 Lakhs",
      "Sub-limit of ₹40,000 for cataract surgery per eye",
      "No coverage for outpatient treatments"
    ],
    good_features: [
      "No Claim Bonus of 10% annually (max 50%)",
      "Free annual health checkup worth ₹2,000",
      "Covers 500+ day care procedures",
      "Pre-hospitalization: 60 days, Post: 90 days",
      "Automatic restoration of Sum Insured"
    ],
    processing_mode: "mock"
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark' : ''}`} style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: 'var(--brand-primary)' }} className="p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">InsureScan</span>
                <span style={{ color: 'var(--text-muted)' }} className="hidden sm:inline text-xs ml-2">AI Policy Analyzer</span>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <span 
                style={{ 
                  backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : 'var(--success-light)',
                  border: '1px solid var(--success)',
                  color: 'var(--success)'
                }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              >
                <span style={{ backgroundColor: 'var(--success)' }} className="w-2 h-2 rounded-full"></span>
                AI Ready
              </span>
              <button 
                style={{ backgroundColor: 'var(--brand-primary)' }}
                className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pb-16">
        {state === 'idle' && (
          <>
            <Hero />
            <FileUpload onFileUpload={handleFileUpload} isLoading={false} />
          </>
        )}

        {state === 'loading' && <LoadingState />}

        {state === 'results' && results && (
          <ResultsDashboard data={results} onReset={handleReset} />
        )}

        {state === 'error' && (
          <div className="max-w-md mx-auto px-4 py-12">
            <div 
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--danger)',
                borderRadius: '12px'
              }} 
              className="p-8 text-center"
            >
              <div style={{ backgroundColor: 'var(--danger-light)' }} className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center">
                <svg style={{ color: 'var(--danger)' }} className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 style={{ color: 'var(--danger)' }} className="text-xl font-bold mb-2">Analysis Failed</h3>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-6">{error}</p>
              <button
                onClick={handleReset}
                style={{ backgroundColor: 'var(--brand-primary)' }}
                className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Built for the Hackathon 🚀 | Empowering Tier 2/3 families with insurance literacy
          </p>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-2 opacity-70">
            Disclaimer: This tool provides AI-generated insights and should not replace professional insurance advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
