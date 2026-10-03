import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2,
  Gauge,
  Play,
  FileText
} from 'lucide-react';
import MockVivaSession from './MockVivaSession';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function VivaQuestionGenerator({ extractedDoc }) {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('mixed');
  const [generationMode, setGenerationMode] = useState('topic'); // 'material' | 'topic'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [isVivaActive, setIsVivaActive] = useState(false);

  // Automatically switch mode to 'material' when a new document is extracted
  useEffect(() => {
    if (extractedDoc) {
      setGenerationMode('material');
      if (!topic && extractedDoc.filename) {
        // Strip file extension for default topic suggestion
        const cleanName = extractedDoc.filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setTopic(cleanName);
      }
    } else {
      setGenerationMode('topic');
    }
  }, [extractedDoc]);

  const handleGenerate = async (e) => {
    e.preventDefault();

    const isMaterialMode = generationMode === 'material' && extractedDoc;

    if (!isMaterialMode && !topic.trim()) {
      setError('Please enter a topic before generating viva questions.');
      return;
    }

    setLoading(true);
    setError(null);
    setQuestionsData(null);
    setIsVivaActive(false);

    const targetUrl = isMaterialMode 
      ? `${API_BASE_URL}/api/ai/questions/from-material` 
      : `${API_BASE_URL}/api/ai/questions`;

    const requestPayload = isMaterialMode 
      ? {
          material: extractedDoc.text,
          topic: topic.trim() || extractedDoc.filename,
          num_questions: parseInt(numQuestions, 10),
          difficulty: difficulty,
        }
      : {
          topic: topic.trim(),
          num_questions: parseInt(numQuestions, 10),
          difficulty: difficulty,
        };

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        let errDetail = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.detail) errDetail = errData.detail;
        } catch (_) {}
        throw new Error(errDetail);
      }

      const data = await response.json();
      setQuestionsData(data.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to communicate with VivaMate AI backend.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadgeClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'diff-badge easy';
      case 'medium':
        return 'diff-badge medium';
      case 'hard':
        return 'diff-badge hard';
      default:
        return 'diff-badge mixed';
    }
  };

  const handleStartViva = () => {
    setIsVivaActive(true);
  };

  const handleStartNewViva = () => {
    setIsVivaActive(false);
    setQuestionsData(null);
  };

  if (isVivaActive && questionsData && questionsData.length > 0) {
    return (
      <div className="viva-generator-container" id="generator-section">
        <MockVivaSession 
          questions={questionsData} 
          topic={topic || extractedDoc?.filename || 'Study Material'} 
          onStartNewViva={handleStartNewViva} 
        />
      </div>
    );
  }

  const isMaterialModeActive = generationMode === 'material' && extractedDoc;

  return (
    <div className="viva-generator-container" id="generator-section">
      <div className="glass-card generator-card">
        <div className="generator-header">
          <div className="generator-badge">
            <Sparkles size={14} /> Phase 5B Material-Grounded Question Engine
          </div>
          <h2 className="generator-title">Generate Custom Viva Questions</h2>
          <p className="generator-subtitle">
            Target your study session with conceptual viva questions generated directly from your uploaded material or subject topic.
          </p>

          {/* Mode Selection Pills if Material Uploaded */}
          {extractedDoc && (
            <div className="mode-selection-bar">
              <button
                type="button"
                className={`mode-pill ${generationMode === 'material' ? 'active' : ''}`}
                onClick={() => setGenerationMode('material')}
              >
                <FileText size={14} /> Use Study Material
              </button>
              <button
                type="button"
                className={`mode-pill ${generationMode === 'topic' ? 'active' : ''}`}
                onClick={() => setGenerationMode('topic')}
              >
                <BookOpen size={14} /> Use Topic Only
              </button>
            </div>
          )}

          {/* Active Material Notification Banner */}
          {isMaterialModeActive && (
            <div className="material-ready-banner">
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>
                Ready to generate from <strong>{extractedDoc.filename}</strong> ({extractedDoc.character_count.toLocaleString()} characters extracted)
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleGenerate} className="generator-form">
          {/* Topic Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="topic-input">
              <BookOpen size={16} /> {isMaterialModeActive ? 'Course Topic (Optional Label)' : 'Course Topic or Concept'}
            </label>
            <input
              id="topic-input"
              type="text"
              className="form-input"
              placeholder={isMaterialModeActive ? `e.g. ${extractedDoc.filename}` : "e.g. TCP Handshake, Operating System Deadlocks, B-Trees"}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              required={!isMaterialModeActive}
            />
          </div>

          <div className="form-row">
            {/* Number of Questions Selector */}
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="num-questions-select">
                <HelpCircle size={16} /> Number of Questions
              </label>
              <select
                id="num-questions-select"
                className="form-select"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={loading}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Question' : 'Questions'}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="form-group flex-1">
              <label className="form-label">
                <Gauge size={16} /> Difficulty Level
              </label>
              <div className="difficulty-segmented">
                {['easy', 'medium', 'hard', 'mixed'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    className={`diff-segment ${difficulty === diff ? 'active' : ''}`}
                    onClick={() => setDifficulty(diff)}
                    disabled={loading}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary generate-btn"
            disabled={loading || (!isMaterialModeActive && !topic.trim())}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" />
                Generating Viva Questions from {isMaterialModeActive ? 'Material' : 'Topic'}...
              </>
            ) : isMaterialModeActive ? (
              <>
                <FileText size={18} />
                Generate Viva From My Material
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Viva Questions
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card loading-card">
          <div className="loading-spinner-wrapper">
            <RefreshCw size={32} className="spin loading-icon" />
          </div>
          <h3 className="loading-title">Ollama AI is crafting your questions...</h3>
          <p className="loading-desc">
            {isMaterialModeActive 
              ? `Extracting conceptual viva questions grounded in "${extractedDoc.filename}" using local open-weight LLM.`
              : `Analyzing "${topic}" at ${difficulty} difficulty using local open-weight LLM.`}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass-card error-card">
          <AlertCircle size={24} className="error-icon" />
          <div className="error-content">
            <h4 className="error-title">Generation Failed</h4>
            <p className="error-desc">{error}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleGenerate}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Results Preview & Start Viva State */}
      {questionsData && questionsData.length > 0 && !loading && (
        <div className="results-container">
          <div className="results-header">
            <div>
              <h3 className="results-title">
                Generated Viva Questions {isMaterialModeActive ? 'from Material' : 'for'} <span className="gradient-text">{topic || extractedDoc?.filename}</span>
              </h3>
              <p className="results-subtitle">
                {questionsData.length} conceptual viva questions ready for practice
              </p>
            </div>
            <button className="btn btn-primary start-viva-btn" onClick={handleStartViva}>
              <Play size={18} /> Start Viva
            </button>
          </div>

          <div className="questions-grid">
            {questionsData.map((q, idx) => (
              <div key={idx} className="glass-card question-card">
                <div className="q-card-header">
                  <span className="q-num-pill">Question #{idx + 1}</span>
                  <div className="q-badges">
                    <span className={getDifficultyBadgeClass(q.difficulty)}>
                      {q.difficulty}
                    </span>
                    <span className="topic-badge">{q.topic || topic || extractedDoc?.filename}</span>
                  </div>
                </div>
                <div className="q-card-body">
                  <p className="q-text">{q.question}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
