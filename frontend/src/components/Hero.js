import React from 'react';

const Hero = () => {
  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-6 inline-flex items-center justify-center">
          <div style={{ backgroundColor: 'var(--brand-primary)' }} className="p-4 rounded-2xl shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Main Title */}
        <h1 style={{ color: 'var(--text-primary)' }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          InsureScan
        </h1>

        {/* Tagline */}
        <p style={{ color: 'var(--text-secondary)' }} className="text-xl sm:text-2xl mb-6 max-w-2xl mx-auto">
          Decode, Compare & Understand Insurance in Seconds
        </p>

        {/* Value Proposition */}
        <p style={{ color: 'var(--text-muted)' }} className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Upload your insurance policy and let our AI identify 
          <span style={{ color: 'var(--danger)' }} className="font-medium"> hidden risks</span>, 
          <span style={{ color: 'var(--warning)' }} className="font-medium"> coverage gaps</span>, and explain everything in 
          <span style={{ color: 'var(--success)' }} className="font-medium"> plain language</span>.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <span 
            style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)' }}
            className="px-4 py-2 rounded-full text-sm font-medium"
          >
            🔍 Smart OCR + AI
          </span>
          <span 
            style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
            className="px-4 py-2 rounded-full text-sm font-medium"
          >
            ⚠️ Red Flag Detection
          </span>
          <span 
            style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)', border: '1px solid var(--info)' }}
            className="px-4 py-2 rounded-full text-sm font-medium"
          >
            📄 PDF & Image Support
          </span>
          <span 
            style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)' }}
            className="px-4 py-2 rounded-full text-sm font-medium"
          >
            🇮🇳 Multi-Language
          </span>
        </div>

        {/* How It Works Section */}
        <div className="max-w-3xl mx-auto">
          <h3 style={{ color: 'var(--text-secondary)' }} className="text-lg font-semibold mb-6">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              className="rounded-xl p-5 text-center"
            >
              <div style={{ backgroundColor: 'var(--brand-light)' }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📤</span>
              </div>
              <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-2">1. Upload</h4>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">Drop your policy PDF or photo</p>
            </div>
            <div 
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              className="rounded-xl p-5 text-center"
            >
              <div style={{ backgroundColor: 'var(--info-light)' }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-2">2. AI Scans</h4>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">We extract & analyze every clause</p>
            </div>
            <div 
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              className="rounded-xl p-5 text-center"
            >
              <div style={{ backgroundColor: 'var(--success-light)' }} className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-2">3. Get Report</h4>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">See risks, gaps & recommendations</p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div style={{ borderTop: '1px solid var(--border-color)' }} className="mt-10 pt-8">
          <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-4">Built for Indian Insurance Policies</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure & Private
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Health, Life, Motor, Travel
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              No Data Stored
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
