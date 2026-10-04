'use client';

import { useState, useEffect } from 'react';
import { toolsApi } from '@/services/tools.service';
import styles from './ToolFeedbackWidget.module.css';

interface ToolFeedbackWidgetProps {
  toolSlug: string;
  className?: string;
  onLiked?: () => void;
}

export default function ToolFeedbackWidget({
  toolSlug,
  className = '',
  onLiked,
}: ToolFeedbackWidgetProps) {
  const [state, setState] = useState<'initial' | 'liked' | 'disliked' | 'submitted'>('initial');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  useEffect(() => {
    // Check if feedback already submitted for this tool
    const key = `tool_feedback_${toolSlug}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setHasFeedback(true);
    }
  }, [toolSlug]);

  if (hasFeedback) return null;

  const handleRating = async (rating: 'like' | 'dislike') => {
    try {
      if (rating === 'like') {
        setState('liked');
        localStorage.setItem(`tool_feedback_${toolSlug}`, 'like');
        await toolsApi.submitFeedback({
          tool_slug: toolSlug,
          rating: 'like',
        });
        if (onLiked) onLiked();

        // Trigger custom window event so BuyMeCoffee or floating tip bar can react dynamically
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tool_feedback_liked', { detail: { toolSlug } }));
        }
      } else {
        setState('disliked');
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const handleReasonSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await toolsApi.submitFeedback({
        tool_slug: toolSlug,
        rating: 'dislike',
        reason: reason.trim() || undefined,
      });
      localStorage.setItem(`tool_feedback_${toolSlug}`, 'dislike');
      setState('submitted');
    } catch (err) {
      console.error('Failed to submit feedback reason:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`tool_feedback_${toolSlug}`, 'skipped');
    setHasFeedback(true);
  };

  return (
    <div className={`${styles.feedbackContainer} ${className}`}>
      {state === 'initial' && (
        <div className={styles.questionRow}>
          <span className={styles.questionText}>Was this tool helpful?</span>
          <div className={styles.actionButtons}>
            <button
              onClick={() => handleRating('like')}
              className={`${styles.btn} ${styles.likeBtn}`}
              type="button"
            >
              👍 Yes
            </button>
            <button
              onClick={() => handleRating('dislike')}
              className={`${styles.btn} ${styles.dislikeBtn}`}
              type="button"
            >
              👎 No
            </button>
          </div>
        </div>
      )}

      {state === 'liked' && (
        <div className={styles.thankYouMessage}>
          <span>🎉 Thank you for your feedback! Glad we could help.</span>
        </div>
      )}

      {state === 'disliked' && (
        <div className={styles.reasonBox}>
          <label className={styles.reasonLabel} htmlFor="feedback-reason">
            What went wrong or how can we improve this tool?
          </label>
          <textarea
            id="feedback-reason"
            className={styles.textarea}
            placeholder="Tell us what didn't work or what features you'd like to see..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className={styles.reasonActions}>
            <button onClick={handleSkip} className={styles.skipBtn} type="button">
              Skip
            </button>
            <button
              onClick={handleReasonSubmit}
              disabled={isSubmitting}
              className={styles.submitBtn}
              type="button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}

      {state === 'submitted' && (
        <div className={`${styles.thankYouMessage} ${styles.dislikeThankYou}`}>
          <span>Thank you for helping us improve! Your feedback has been saved.</span>
        </div>
      )}
    </div>
  );
}
