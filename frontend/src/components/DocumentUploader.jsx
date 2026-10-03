import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw,
  FileCheck
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function DocumentUploader({ onDocumentExtracted }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'txt') {
      return 'Unsupported file format. Only PDF (.pdf) and TXT (.txt) files are supported.';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds maximum allowed limit of 10 MB.';
    }
    return null;
  };

  const handleFileSelect = (file) => {
    setError(null);
    if (!file) return;

    const valErr = validateFile(file);
    if (valErr) {
      setError(valErr);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errDetail = `Upload failed (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.detail) errDetail = errData.detail;
        } catch (_) {}
        throw new Error(errDetail);
      }

      const data = await response.json();
      setUploadedData(data);
      if (onDocumentExtracted) {
        onDocumentExtracted(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and extract document text.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onDocumentExtracted) {
      onDocumentExtracted(null);
    }
  };

  return (
    <div className="doc-uploader-card glass-card">
      <div className="doc-uploader-header">
        <div className="generator-badge">
          <FileText size={14} /> Phase 5A Study Material Engine
        </div>
        <h3 className="doc-uploader-title">Upload Course Material & Notes</h3>
        <p className="doc-uploader-subtitle">
          Upload your lecture notes or syllabus (.pdf or .txt) to extract concept text for your viva session.
        </p>
      </div>

      {!uploadedData ? (
        <div className="uploader-content">
          {/* Drag and Drop Zone */}
          <div 
            className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {!selectedFile ? (
              <div className="drop-zone-idle">
                <div className="upload-icon-wrapper">
                  <UploadCloud size={32} className="upload-icon" />
                </div>
                <p className="drop-zone-prompt">
                  <strong>Click to browse</strong> or drag & drop your study material
                </p>
                <div className="supported-formats-pills">
                  <span className="format-pill">PDF (.pdf)</span>
                  <span className="format-pill">Plain Text (.txt)</span>
                  <span className="format-pill max-size">Max 10 MB</span>
                </div>
              </div>
            ) : (
              <div className="selected-file-info">
                <FileText size={28} color="var(--primary-light)" />
                <div className="file-details">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                </div>
                <button 
                  type="button" 
                  className="icon-btn remove-file-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  title="Remove selected file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="answer-validation-alert" style={{ marginTop: '1rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {selectedFile && !uploading && (
            <button 
              type="button" 
              className="btn btn-primary upload-submit-btn" 
              onClick={handleUpload}
            >
              <UploadCloud size={18} /> Extract Text from Document
            </button>
          )}

          {uploading && (
            <div className="eval-loading-box glass-card" style={{ marginTop: '1rem' }}>
              <RefreshCw size={24} className="spin loading-icon" />
              <div>
                <h4 className="eval-loading-title">Processing & Extracting Document Text...</h4>
                <p className="eval-loading-desc">Parsing PDF/TXT layout and computing character index.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Success State Display */
        <div className="upload-success-card">
          <div className="success-banner">
            <div className="success-icon-wrapper">
              <FileCheck size={28} color="var(--accent-emerald)" />
            </div>
            <div className="success-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 className="success-filename">{uploadedData.filename}</h4>
                <span className="badge badge-open-ai">
                  <CheckCircle2 size={12} /> Text Extracted
                </span>
              </div>
              <p className="success-stats">
                <strong className="gradient-text">{uploadedData.character_count.toLocaleString()}</strong> characters extracted into session memory
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={handleClear}
            >
              <X size={14} /> Clear / Replace File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
