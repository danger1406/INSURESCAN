import React from 'react';

const LoadingState = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div 
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        className="rounded-xl p-8"
      >
        {/* Animated document with full scanning line */}
        <div className="relative w-28 h-36 mx-auto mb-6">
          {/* Document background */}
          <div 
            style={{ backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}
            className="absolute inset-0 rounded-lg shadow-lg"
          >
            {/* Document corner fold */}
            <div 
              style={{ 
                position: 'absolute',
                top: 0,
                right: 0,
                width: '20px',
                height: '20px',
                backgroundColor: 'var(--bg-tertiary)',
                borderLeft: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
              }}
            />
            
            {/* Document lines - text placeholder */}
            <div className="p-3 pt-6 space-y-2">
              <div style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }} className="h-2 rounded w-full"></div>
              <div style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }} className="h-2 rounded w-4/5"></div>
              <div style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }} className="h-2 rounded w-full"></div>
              <div style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }} className="h-2 rounded w-3/5"></div>
              <div style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }} className="h-2 rounded w-4/5"></div>
              <div style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }} className="h-2 rounded w-2/3"></div>
              <div style={{ backgroundColor: 'var(--text-muted)', opacity: 0.3 }} className="h-2 rounded w-full"></div>
            </div>
          </div>
          
          {/* Scanning line - moves from top to bottom and back */}
          <div 
            style={{ 
              backgroundColor: 'var(--brand-primary)',
              boxShadow: '0 0 10px var(--brand-primary), 0 0 20px var(--brand-primary)',
              position: 'absolute',
              left: '4px',
              right: '4px',
              height: '3px',
              borderRadius: '2px'
            }}
            className="animate-scan-line"
          />
        </div>

        <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold mb-2">
          Analyzing Your Policy
        </h3>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-6">
          Our AI is reading through the document...
        </p>

        {/* Progress steps */}
        <div className="space-y-3 text-left max-w-xs mx-auto">
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'var(--success)' }} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Document uploaded</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'var(--success)' }} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
            <span style={{ color: 'var(--text-secondary)' }} className="text-sm">Text extracted</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'var(--brand-primary)' }} className="w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </div>
            <span style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">AI analyzing clauses...</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--border-color)' }} className="w-6 h-6 rounded-full"></div>
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">Generating report</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
