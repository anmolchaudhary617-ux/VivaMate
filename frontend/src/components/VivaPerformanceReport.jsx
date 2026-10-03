import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  RotateCcw, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  HelpCircle, 
  Lightbulb, 
  ThumbsUp, 
  Target, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function VivaPerformanceReport({ submittedAnswers, totalQuestions, topic, onPracticeAgain, onStartNewViva }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Filter evaluated items safely handling unevaluated cases
  const evaluatedItems = (submittedAnswers || []).filter(item => item && item.evaluation && typeof item.evaluation.score === 'number');
  
  // Calculate average score and percentage
  const totalScoreSum = evaluatedItems.reduce((acc, item) => acc + item.evaluation.score, 0);
  const avgScore = evaluatedItems.length > 0 ? (totalScoreSum / evaluatedItems.length).toFixed(1) : '0.0';
  const percentage = Math.round((parseFloat(avgScore) / 10) * 100);

  // Performance grade designation
  const getPerformanceGrade = (scoreNum) => {
    if (scoreNum >= 8.5) return { label: 'Excellent', badge: 'easy' };
    if (scoreNum >= 7.0) return { label: 'Proficient', badge: 'mixed' };
    if (scoreNum >= 5.0) return { label: 'Developing', badge: 'medium' };
    return { label: 'Needs Review', badge: 'hard' };
  };

  const gradeInfo = getPerformanceGrade(parseFloat(avgScore));

  // Derive Strengths (items with score >= 7)
  const strengths = evaluatedItems.filter(item => item.evaluation.score >= 7);

  // Derive Areas to Improve (items with score < 7)
  const improvements = evaluatedItems.filter(item => item.evaluation.score < 7);

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

  const getCorrectnessBadgeClass = (correctness) => {
    switch (correctness?.toLowerCase()) {
      case 'correct':
        return 'correctness-badge correct';
      case 'mostly correct':
        return 'correctness-badge mostly-correct';
      case 'partially correct':
        return 'correctness-badge partially-correct';
      default:
        return 'correctness-badge incorrect';
    }
  };

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="viva-report-dashboard">
      {/* Report Header Card */}
      <div className="glass-card report-hero-card">
        <div className="report-hero-badge">
          <Award size={14} /> Phase 6 Final Viva Performance Report
        </div>
        <h2 className="report-title">Viva Performance Dashboard</h2>
        <p className="report-subtitle">
          Oral viva assessment summary for <strong className="gradient-text">{topic}</strong>
        </p>

        {/* Score Overview Grid */}
        <div className="report-score-grid">
          {/* Main Overall Score Ring Card */}
          <div className="glass-card score-circle-card">
            <div className="circular-progress-wrapper" style={{ '--progress-pct': `${percentage}%` }}>
              <div className="circular-progress-inner">
                <span className="big-score-number">{avgScore}</span>
                <span className="score-denom">/ 10</span>
              </div>
            </div>
            <div className="score-meta-box">
              <span className={`diff-badge ${gradeInfo.badge}`} style={{ fontSize: '0.85rem' }}>
                {gradeInfo.label} ({percentage}%)
              </span>
              <span className="evaluated-count-label">
                {evaluatedItems.length} of {totalQuestions} Questions Evaluated
              </span>
            </div>
          </div>

          {/* Key Metrics Quick Stats */}
          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <div className="metric-icon green">
                <ThumbsUp size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{strengths.length}</span>
                <span className="metric-label">Concepts Mastered</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div className="metric-icon amber">
                <Target size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-value">{improvements.length}</span>
                <span className="metric-label">Concepts to Review</span>
              </div>
            </div>

            <div className="glass-card metric-card">
              <div className="metric-icon blue">
                <Sparkles size={20} />
              </div>
              <div className="metric-info">
                <span className="metric-value">Qwen3 4B</span>
                <span className="metric-label">AI Examiner Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section: Strengths & Areas to Improve */}
      <div className="insights-row-grid">
        {/* Strengths Card */}
        <div className="glass-card insight-card strength-card">
          <div className="insight-card-header">
            <ThumbsUp size={20} className="eval-icon-green" />
            <h3>Key Strengths</h3>
          </div>
          {strengths.length > 0 ? (
            <ul className="insight-list">
              {strengths.map((item, idx) => (
                <li key={idx} className="insight-item">
                  <CheckCircle2 size={16} className="eval-icon-green" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong className="insight-question-title">{item.question}</strong>
                    <p className="insight-detail">Scored {item.evaluation.score}/10 — {item.evaluation.correctness}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-insight-msg">Continue practicing to demonstrate strong concept mastery!</p>
          )}
        </div>

        {/* Areas to Improve Card */}
        <div className="glass-card insight-card improve-card">
          <div className="insight-card-header">
            <Target size={20} className="eval-icon-blue" />
            <h3>Areas to Improve</h3>
          </div>
          {improvements.length > 0 ? (
            <ul className="insight-list">
              {improvements.map((item, idx) => (
                <li key={idx} className="insight-item">
                  <AlertCircle size={16} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong className="insight-question-title">{item.question}</strong>
                    <p className="insight-detail">{item.evaluation.feedback}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-insight-msg">Outstanding performance! No critical knowledge gaps identified.</p>
          )}
        </div>
      </div>

      {/* Question Review Expandable List Section */}
      <div className="glass-card report-breakdown-card">
        <div className="breakdown-header">
          <div>
            <h3>Detailed Question-by-Question Review</h3>
            <span className="evaluated-count-label">Click any question to view your response, AI feedback, ideal answer, and follow-up question</span>
          </div>
        </div>

        <div className="breakdown-list">
          {submittedAnswers.map((item, idx) => {
            const hasEval = item && item.evaluation;
            const isExpanded = expandedIndex === idx;

            return (
              <div key={idx} className={`glass-card review-item-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="review-item-header" onClick={() => toggleExpand(idx)}>
                  <div className="review-title-group">
                    <span className="q-num-pill">Q#{idx + 1}</span>
                    <span className="review-q-text">{item.question}</span>
                  </div>

                  <div className="review-header-badges">
                    <span className={getDifficultyBadgeClass(item.difficulty)}>
                      {item.difficulty}
                    </span>
                    {hasEval ? (
                      <>
                        <span className={getCorrectnessBadgeClass(item.evaluation.correctness)}>
                          {item.evaluation.correctness}
                        </span>
                        <span className="eval-score-pill">
                          {item.evaluation.score}/10
                        </span>
                      </>
                    ) : (
                      <span className="diff-badge mixed">Not Evaluated</span>
                    )}
                    <button type="button" className="expand-chevron-btn" aria-label="Toggle Question Review">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="review-item-body">
                    {/* Student's Answer */}
                    <div className="user-answer-box">
                      <span className="user-answer-label">Your Response:</span>
                      <p className="user-answer-text">{item.answer || '(No answer provided)'}</p>
                    </div>

                    {hasEval ? (
                      <div className="eval-summary-subcard">
                        <div className="eval-subrow">
                          <MessageSquare size={16} className="eval-icon-blue" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>Examiner Feedback:</strong>
                            <p style={{ marginTop: '2px' }}>{item.evaluation.feedback}</p>
                          </div>
                        </div>

                        <div className="eval-subrow">
                          <Lightbulb size={16} className="eval-icon-green" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>Ideal Viva Answer:</strong>
                            <p style={{ marginTop: '2px' }} className="ideal-text">{item.evaluation.ideal_answer}</p>
                          </div>
                        </div>

                        {item.evaluation.follow_up_question && (
                          <div className="eval-subrow">
                            <HelpCircle size={16} className="eval-icon-purple" style={{ flexShrink: 0 }} />
                            <div>
                              <strong>Suggested Follow-Up Question:</strong>
                              <p style={{ marginTop: '2px' }} className="follow-up-text">{item.evaluation.follow_up_question}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="answer-validation-alert" style={{ marginTop: '0.5rem' }}>
                        <AlertCircle size={16} />
                        <span>This question was skipped or not evaluated by AI.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="report-actions-bar">
        <button type="button" className="btn btn-secondary action-report-btn" onClick={onPracticeAgain}>
          <RefreshCw size={18} /> Practice Again
        </button>
        <button type="button" className="btn btn-primary action-report-btn" onClick={onStartNewViva}>
          <RotateCcw size={18} /> Generate New Viva
        </button>
      </div>
    </div>
  );
}
