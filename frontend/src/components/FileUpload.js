import React, { useState, useCallback } from 'react';

const FileUpload = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileUpload(selectedFile, false);
    }
  };

  const handleDemo = () => {
    onFileUpload(null, true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          backgroundColor: isDragging ? 'var(--brand-light)' : 'var(--bg-card)',
          border: `2px dashed ${isDragging ? 'var(--brand-primary)' : 'var(--border-color)'}`,
          borderRadius: '12px'
        }}
        className="p-8 text-center cursor-pointer transition-all"
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".pdf,image/*"
          onChange={handleFileSelect}
        />
        
        <label htmlFor="fileInput" className="cursor-pointer block">
          <div 
            style={{ backgroundColor: 'var(--brand-light)' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          >
            <svg style={{ color: 'var(--brand-primary)' }} className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {selectedFile ? (
            <div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold mb-1">{selectedFile.name}</p>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-primary)' }} className="font-semibold mb-1">
                Drop your policy document here
              </p>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">
                or click to browse (PDF, JPG, PNG)
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
        {selectedFile && (
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            style={{ backgroundColor: 'var(--brand-primary)' }}
            className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : '🔍 Analyze Policy'}
          </button>
        )}
        
        <button
          onClick={handleDemo}
          disabled={isLoading}
          style={{ 
            backgroundColor: 'var(--warning-light)',
            color: 'var(--warning)',
            border: '1px solid var(--warning)'
          }}
          className="px-6 py-3 font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          🎯 Quick Demo
        </button>
      </div>

      {/* Supported formats */}
      <div className="mt-6 text-center">
        <p style={{ color: 'var(--text-muted)' }} className="text-xs">
          Supported: PDF documents, scanned images (JPG, PNG)
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
