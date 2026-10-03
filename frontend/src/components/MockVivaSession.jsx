import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Sparkles, 
  FileText,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import VivaPerformanceReport from './VivaPerformanceReport';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function MockVivaSession({ questions, topic, onStartNewViva }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

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

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim()) {
      setValidationError('Please type your answer before submitting.');
      return;
    }

    setValidationError(null);
    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: currentAnswer.trim(),
          topic: currentQuestion.topic || topic,
          difficulty: currentQuestion.difficulty || 'medium',
        }),
      });

      if (!response.ok) {
        let errDetail = `Evaluation error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.detail) errDetail = errData.detail;
        } catch (_) {}
        throw new Error(errDetail);
      }

      const evalData = await response.json();
      setCurrentEvaluation(evalData);
      setIsSubmitted(true);

      // Save answer and evaluation into session state
      setSubmittedAnswers(prev => {
        const updated = [...prev];
        updated[currentIndex] = {
          ...currentQuestion,
          answer: currentAnswer.trim(),
          evaluation: evalData,
        };
        return updated;
      });
    } catch (err) {
      setEvaluationError(err.message || 'Failed to evaluate answer with AI service.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswer('');
      setIsSubmitted(false);
      setCurrentEvaluation(null);
      setValidationError(null);
      setEvaluationError(null);
    } else {
      setIsComplete(true);
    }
  };

  const handlePracticeAgain = () => {
    setCurrentIndex(0);
    setCurrentAnswer('');
    setIsSubmitted(false);
    setCurrentEvaluation(null);
    setValidationError(null);
    setEvaluationError(null);
    setIsComplete(false);
  };

  // Completion Screen (Phase 6 Final Viva Performance Report)
  if (isComplete) {
    return (
      <VivaPerformanceReport 
        submittedAnswers={submittedAnswers}
        totalQuestions={questions.length}
        topic={topic}
        onPracticeAgain={handlePracticeAgain}
        onStartNewViva={onStartNewViva}
      />
    );
  }

  // Active Single Question Session Screen
  return (
    <div className="viva-session-card glass-card">
      {/* Session Progress Header */}
      <div className="viva-session-header">
        <div className="progress-info-row">
          <div className="step-counter">
            <Sparkles size={16} color="var(--primary-light)" />
            <span>Question <strong>{currentIndex + 1}</strong> of {questions.length}</span>
          </div>
          <div className="progress-percentage-pill">{progressPercent}% Completed</div>
        </div>

        {/* Visual Progress Bar */}
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Question Header & Body */}
      <div className="viva-question-box">
        <div className="viva-q-meta">
          <span className={getDifficultyBadgeClass(currentQuestion.difficulty)}>
            {currentQuestion.difficulty}
          </span>
          <span className="topic-badge">{currentQuestion.topic || topic}</span>
        </div>
        <h3 className="viva-q-title">{currentQuestion.question}</h3>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmitAnswer} className="viva-answer-form">
        <div className="form-group">
          <label className="form-label" htmlFor="answer-textarea">
            <FileText size={16} /> Your Oral Answer Draft
          </label>
          <textarea
            id="answer-textarea"
            className="form-textarea"
            rows={5}
            placeholder="Type your explanation as if speaking out loud to the viva examiner..."
            value={currentAnswer}
            onChange={(e) => {
              setCurrentAnswer(e.target.value);
              if (validationError) setValidationError(null);
            }}
            disabled={isSubmitted || isEvaluating}
          />
        </div>

        {validationError && (
          <div className="answer-validation-alert">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {/* Evaluation Loading State */}
        {isEvaluating && (
          <div className="eval-loading-box glass-card">
            <RefreshCw size={24} className="spin loading-icon" />
            <div>
              <h4 className="eval-loading-title">Evaluating your answer with Open-Weight AI...</h4>
              <p className="eval-loading-desc">Analyzing conceptual accuracy, completeness, and viva performance.</p>
            </div>
          </div>
        )}

        {/* Evaluation Error State */}
        {evaluationError && !isEvaluating && (
          <div className="answer-validation-alert">
            <AlertCircle size={16} />
            <span>{evaluationError}</span>
          </div>
        )}

        {/* AI Evaluation Output Display */}
        {isSubmitted && currentEvaluation && (
          <div className="eval-result-card glass-card">
            <div className="eval-result-header">
              <div className="eval-score-box">
                <Sparkles size={18} className="sparkle-gold" />
                <span>Score: <strong className="score-num">{currentEvaluation.score}</strong> / 10</span>
              </div>
              <span className={getCorrectnessBadgeClass(currentEvaluation.correctness)}>
                {currentEvaluation.correctness}
              </span>
            </div>

            <div className="eval-section">
              <h5 className="eval-section-title">
                <MessageSquare size={16} className="eval-icon-blue" /> Examiner Feedback
              </h5>
              <p className="eval-section-text">{currentEvaluation.feedback}</p>
            </div>

            <div className="eval-section">
              <h5 className="eval-section-title">
                <Lightbulb size={16} className="eval-icon-green" /> Ideal Viva Answer
              </h5>
              <p className="eval-section-text ideal-text">{currentEvaluation.ideal_answer}</p>
            </div>

            {currentEvaluation.follow_up_question && (
              <div className="eval-section follow-up-section">
                <h5 className="eval-section-title">
                  <HelpCircle size={16} className="eval-icon-purple" /> Suggested Follow-Up Question
                </h5>
                <p className="eval-section-text follow-up-text">{currentEvaluation.follow_up_question}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="viva-action-buttons">
          {!isSubmitted ? (
            <button 
              type="submit" 
              className="btn btn-primary submit-ans-btn"
              disabled={isEvaluating || !currentAnswer.trim()}
            >
              {isEvaluating ? (
                <>
                  <RefreshCw size={18} className="spin" /> Evaluating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Submit Answer for AI Evaluation
                </>
              )}
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary next-q-btn"
              onClick={handleNextQuestion}
            >
              {currentIndex + 1 < questions.length ? (
                <>
                  Next Question <ArrowRight size={18} />
                </>
              ) : (
                <>
                  Complete Viva <Award size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
