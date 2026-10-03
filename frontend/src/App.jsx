import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Activity,
  RefreshCw,
  FileText,
  Sliders,
  Bot,
  BarChart3,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import VivaQuestionGenerator from './components/VivaQuestionGenerator';
import DocumentUploader from './components/DocumentUploader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  const [extractedDoc, setExtractedDoc] = useState(null);
  const [healthState, setHealthState] = useState({
    status: 'checking', // 'online' | 'offline' | 'checking'
    data: null,
    error: null,
    latency: null
  });

  const checkHealth = async () => {
    setHealthState(prev => ({ ...prev, status: 'checking', error: null }));
    const startTime = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const endTime = performance.now();
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();
      setHealthState({
        status: 'online',
        data,
        error: null,
        latency: Math.round(endTime - startTime)
      });
    } catch (err) {
      setHealthState({
        status: 'offline',
        data: null,
        error: err.message || 'Failed to connect to backend service',
        latency: null
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="header">
        <div className="header-container">
          <a href="#" className="brand">
            <div className="brand-icon">
              <GraduationCap size={24} />
            </div>
            <span>Viva<span className="gradient-text">Mate</span></span>
          </a>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-hacktober">
              <Sparkles size={12} /> Hacktoberfest 2026
            </span>
            <span className="badge badge-open-ai">
              <Cpu size={12} /> Open-Weight AI
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-tag">
          <Sparkles size={16} /> Built for the "Build for a Friend" Hacktober Challenge
        </div>

        <h1 className="hero-title">
          Master Your Oral Vivas with <br />
          <span className="gradient-text">Local Open-Weight AI</span>
        </h1>

        <p className="hero-subtitle">
          VivaMate is an intelligent mock viva practice platform designed specifically for students.
          Upload your notes, choose your topic, and practice with real-time AI viva questions and evaluation.
        </p>

        {/* Backend Health Status Indicator Component */}
        <div className="glass-card status-card">
          <div className="status-header">
            <div className="status-title">
              <Activity size={20} color="var(--primary-light)" />
              <span>Backend Connection Status</span>
            </div>

            <div className={`status-pill ${healthState.status}`}>
              <div className={`pulse-dot ${healthState.status === 'online' ? 'green' :
                  healthState.status === 'offline' ? 'red' : 'amber'
                }`} />
              <span>
                {healthState.status === 'online' && 'Backend Connected'}
                {healthState.status === 'offline' && 'Backend Disconnected'}
                {healthState.status === 'checking' && 'Connecting to API...'}
              </span>
            </div>
          </div>

          <div className="status-details">
            <div className="detail-item">
              <span className="detail-label">Target Endpoint</span>
              <span className="detail-value">{API_BASE_URL}/api/health</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Service Name</span>
              <span className="detail-value">
                {healthState.data?.service || (healthState.status === 'checking' ? 'Querying...' : 'Unavailable')}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Latency</span>
              <span className="detail-value">
                {healthState.latency ? `${healthState.latency} ms` : '—'}
              </span>
            </div>
          </div>

          {healthState.error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: '#fda4af',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{healthState.error}. Ensure FastAPI is running on {API_BASE_URL}.</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              className="btn btn-secondary"
              onClick={checkHealth}
              disabled={healthState.status === 'checking'}
            >
              <RefreshCw size={16} className={healthState.status === 'checking' ? 'spin' : ''} />
              {healthState.status === 'checking' ? 'Testing Connection...' : 'Re-test API Connection'}
            </button>
          </div>
        </div>
      </section>

      {/* Document Uploader Component (Phase 5A) */}
      <div style={{ maxWidth: '900px', margin: '0 auto 2rem', padding: '0 1.5rem' }}>
        <DocumentUploader onDocumentExtracted={setExtractedDoc} />
      </div>

      {/* Main Feature Engine: Viva Question Generator */}
      <VivaQuestionGenerator extractedDoc={extractedDoc} />

      {/* Planned Feature Architecture Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">VivaMate System Architecture</h2>
          <p className="section-subtitle">Designed incrementally for Hacktoberfest 2026</p>
        </div>

        <div className="grid">
          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <FileText size={24} />
            </div>
            <span className="feature-badge">01</span>
            <h3 className="feature-title">Material Upload</h3>
            <p className="feature-desc">
              Upload course PDFs or raw text notes. VivaMate extracts key concepts and context automatically.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <Sliders size={24} />
            </div>
            <span className="feature-badge">02</span>
            <h3 className="feature-title">Session Customization</h3>
            <p className="feature-desc">
              Configure subject focus, viva difficulty, question depth, and mock exam duration.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <Bot size={24} />
            </div>
            <span className="feature-badge">03</span>
            <h3 className="feature-title">Interactive Mock Viva</h3>
            <p className="feature-desc">
              Experience one-on-one viva questioning, adaptive follow-ups, and real-time answer evaluation.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <BarChart3 size={24} />
            </div>
            <span className="feature-badge">04</span>
            <h3 className="feature-title">Performance Report</h3>
            <p className="feature-desc">
              Receive detailed breakdown scores, strength/weakness analysis, and tailored improvement tips.
            </p>
          </div>
        </div>
      </section>

      {/* Open-Weight AI Architecture Story */}
      <section className="features-section">
        <div className="glass-card arch-card">
          <div>
            <div className="hero-tag" style={{ marginBottom: '1rem' }}>
              <ShieldCheck size={16} /> Privacy-First & 100% Open Source
            </div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Powered by Open-Weight AI
            </h2>
            <p className="feature-desc" style={{ marginBottom: '1rem' }}>
              VivaMate leverages Ollama and open-weight LLMs locally on your machine.
            </p>
            <ul style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.925rem',
              color: 'var(--text-muted)'
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" /> Zero study material leaks to third-party APIs
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" /> No paywalls or per-request API costs
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" /> Modular architecture — easily swap or tune open models
              </li>
            </ul>
          </div>

          <div className="arch-flow">
            <div className="flow-step">
              <span className="flow-step-num">1</span>
              <span>React Frontend (Vite)</span>
            </div>
            <div className="flow-step">
              <span className="flow-step-num">2</span>
              <span>FastAPI Backend Service</span>
            </div>
            <div className="flow-step">
              <span className="flow-step-num">3</span>
              <span>AI Service Layer (Modular)</span>
            </div>
            <div className="flow-step" style={{ borderColor: 'var(--primary)', background: 'rgba(99, 102, 241, 0.15)' }}>
              <span className="flow-step-num" style={{ background: 'var(--accent-cyan)' }}>4</span>
              <span>Ollama + Open-Weight LLM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>VivaMate • Hacktoberfest 2026 Project • Phase 1 Foundation</p>
      </footer>
    </div>
  );
}
