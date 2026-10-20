'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Coffee,
  Check,
  X,
  Send,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { toolsApi } from '@/services/tools.service';
import styles from './ToolFeedbackWidget.module.css';

interface ToolFeedbackWidgetProps {
  toolSlug: string;
  className?: string;
  onLiked?: () => void;
}

const COMMON_DISLIKE_ISSUES = [
  'Download failed',
  'Output quality issue',
  'Too slow',
  'Format error',
  'Missing a feature',
  'Confusing interface',
];

const COMMON_FEATURE_SUGGESTIONS = [
  'Batch processing',
  'Faster conversion',
  'More format options',
  'Dark mode preview',
  'Mobile app',
  'Custom quality slider',
];

export default function ToolFeedbackWidget({
  toolSlug,
  className = '',
  onLiked,
}: ToolFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<'initial' | 'positive_suggest' | 'disliked' | 'submitted'>('initial');
  
  // Feedback states
  const [reason, setReason] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [positiveChips, setPositiveChips] = useState<string[]>([]);
  const [positiveNotes, setPositiveNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if feedback already submitted or skipped
  const isAlreadyHandled = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const key = `tool_feedback_${toolSlug}`;
    return !!localStorage.getItem(key);
  }, [toolSlug]);

  // Open modal with a delay AFTER download
  const triggerModal = useCallback((delayMs = 2500) => {
    if (isAlreadyHandled()) return;

    if (triggerTimeoutRef.current) {
      clearTimeout(triggerTimeoutRef.current);
    }

    triggerTimeoutRef.current = setTimeout(() => {
      if (!isAlreadyHandled()) {
        setIsOpen(true);
      }
    }, delayMs);
  }, [isAlreadyHandled]);

  useEffect(() => {
    // 1. Listen for custom window event: 'tool_action_completed'
    const handleActionCompleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ toolSlug?: string; action?: string }>;
      if (customEvent.detail?.toolSlug && customEvent.detail.toolSlug !== toolSlug) {
        return;
      }
      triggerModal(2000);
    };

    // 2. Automatically detect final DOWNLOAD & SAVE clicks ONLY
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const btn = target.closest('button, a, [role="button"]') as HTMLElement | null;
      if (!btn) return;

      const container = document.getElementById('tool-content');
      if (!container || !container.contains(btn)) return;

      const text = (btn.textContent || '').trim().toLowerCase();
      const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
      const title = (btn.getAttribute('title') || '').toLowerCase();
      const className = (btn.className || '').toString().toLowerCase();
      const dataAction = (btn.getAttribute('data-action') || '').toLowerCase();

      // Exclude processing triggers
      const isProcessingTrigger =
        text.includes('compress image') ||
        text.includes('ai optimize') ||
        text === 'convert' ||
        text === 'compress' ||
        text === 'clear all' ||
        text === 'remove' ||
        className.includes('btn-convert--ai') ||
        className.includes('preview-remove') ||
        className.includes('btn-clear-all');

      if (isProcessingTrigger) {
        return;
      }

      // Positive match for download or copy actions
      const isDownload =
        className.includes('btn-download') ||
        dataAction === 'download' ||
        text.includes('download') ||
        ariaLabel.includes('download') ||
        title.includes('download');

      const isCopyOutput =
        btn.closest('.tool-result-section, .tool-output, .output-section') !== null &&
        (text.includes('copy') || ariaLabel.includes('copy') || title.includes('copy'));

      if (isDownload || isCopyOutput) {
        triggerModal(2500);
      }
    };

    // Expose manual trigger globally
    (window as any).triggerToolFeedbackModal = () => triggerModal(0);

    window.addEventListener('tool_action_completed', handleActionCompleted);
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      window.removeEventListener('tool_action_completed', handleActionCompleted);
      document.removeEventListener('click', handleGlobalClick, true);
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, [toolSlug, triggerModal]);

  // Handle closing modal
  const handleClose = (markSkipped = true) => {
    setIsOpen(false);
    if (markSkipped && !localStorage.getItem(`tool_feedback_${toolSlug}`)) {
      localStorage.setItem(`tool_feedback_${toolSlug}`, 'skipped');
    }
  };

  // Keyboard accessibility: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose(state === 'initial');
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, state]);

  // Handle Positive Feedback (Like) -> switches to Suggestion & Coffee dialog!
  const handleRatingLike = async () => {
    try {
      localStorage.setItem(`tool_feedback_${toolSlug}`, 'like');

      // Immediate like record in backend
      await toolsApi.submitFeedback({
        tool_slug: toolSlug,
        rating: 'like',
      });

      if (onLiked) onLiked();

      // Trigger custom window event so bottom-right BuyMeCoffee wakes up
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tool_feedback_liked', { detail: { toolSlug } }));
      }

      // Transition to positive suggestion dialog with Buy Me a Coffee CTA
      setState('positive_suggest');
    } catch (err: any) {
      console.error('Failed to submit like rating:', err);
      // Still show the suggestion screen so user experience isn't blocked
      setState('positive_suggest');
    }
  };

  // Submit positive suggestions
  const handlePositiveSuggestionSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const parts: string[] = [];
    if (positiveChips.length > 0) {
      parts.push(`Suggestions: ${positiveChips.join(', ')}`);
    }
    if (positiveNotes.trim()) {
      parts.push(positiveNotes.trim());
    }
    const fullSuggestion = parts.join(' \n\n ');

    try {
      if (fullSuggestion) {
        await toolsApi.submitFeedback({
          tool_slug: toolSlug,
          rating: 'like',
          reason: fullSuggestion,
        });
      }

      setState('submitted');
      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit suggestion';
      console.error('Failed to submit suggestion:', msg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Negative Feedback
  const handleRatingDislike = () => {
    setState('disliked');
    setErrorMessage(null);
  };

  // Toggle quick issue chips
  const toggleDislikeChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  // Toggle positive suggestion chips
  const togglePositiveChip = (chip: string) => {
    setPositiveChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  // Submit dislike reason
  const handleReasonSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const parts: string[] = [];
    if (selectedChips.length > 0) {
      parts.push(`Issues: ${selectedChips.join(', ')}`);
    }
    if (reason.trim()) {
      parts.push(reason.trim());
    }
    const fullReason = parts.join(' \n\n ');

    try {
      await toolsApi.submitFeedback({
        tool_slug: toolSlug,
        rating: 'dislike',
        reason: fullReason || undefined,
      });

      localStorage.setItem(`tool_feedback_${toolSlug}`, 'dislike');
      setState('submitted');

      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 1800);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit feedback';
      console.error('Failed to submit feedback reason:', msg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={() => handleClose(state === 'initial')}>
      <div
        className={`${styles.modalDialog} ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        {/* Close button with Lucide icon */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => handleClose(state === 'initial')}
          aria-label="Close feedback modal"
        >
          <X size={18} />
        </button>

        {/* ── STATE 1: INITIAL QUESTION ── */}
        {state === 'initial' && (
          <div className={styles.modalBodyInitial}>
            <div className={styles.iconBadge}>
              <Sparkles size={24} className={styles.sparkleIcon} />
            </div>
            <h2 id="feedback-modal-title" className={styles.modalTitle}>
              Was this tool helpful?
            </h2>
            <p className={styles.modalSubtitle}>
              Did you get the result you were looking for? Your feedback keeps our tools free & fast.
            </p>

            <div className={styles.ratingChoiceRow}>
              <button
                type="button"
                onClick={handleRatingLike}
                className={`${styles.ratingChoiceBtn} ${styles.likeChoiceBtn}`}
              >
                <span className={styles.choiceIconWrapper}>
                  <ThumbsUp size={18} />
                </span>
                <span className={styles.choiceText}>Yes, worked great!</span>
              </button>

              <button
                type="button"
                onClick={handleRatingDislike}
                className={`${styles.ratingChoiceBtn} ${styles.dislikeChoiceBtn}`}
              >
                <span className={styles.choiceIconWrapper}>
                  <ThumbsDown size={18} />
                </span>
                <span className={styles.choiceText}>Not quite / Had issues</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 2: POSITIVE SUGGESTION & BUY ME A COFFEE ── */}
        {state === 'positive_suggest' && (
          <div className={styles.modalBodySuggest}>
            <div className={styles.heartIconBadge}>
              <Heart size={26} className={styles.heartIcon} />
            </div>
            <h2 className={styles.modalTitle}>Glad we could help!</h2>
            <p className={styles.modalSubtitle}>
              Have an idea, new feature, or suggestion to make this tool even better?
            </p>

            {/* Quick feature suggestion chips */}
            <div className={styles.chipsContainer}>
              {COMMON_FEATURE_SUGGESTIONS.map((chip) => {
                const active = positiveChips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    className={`${styles.chipBtn} ${styles.positiveChip} ${active ? styles.activePositiveChip : ''}`}
                    onClick={() => togglePositiveChip(chip)}
                  >
                    {active && <Check size={13} className={styles.chipCheckIcon} />}
                    {chip}
                  </button>
                );
              })}
            </div>

            <textarea
              className={styles.textarea}
              placeholder="Suggest a feature, new tool idea, or improvement... (optional)"
              value={positiveNotes}
              onChange={(e) => setPositiveNotes(e.target.value)}
              rows={3}
            />

            {/* Buy Me a Coffee Call To Action */}
            <a
              href="https://www.buymeacoffee.com/fusiontools"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.coffeeCtaCard}
            >
              <div className={styles.coffeeCtaIconWrapper}>
                <Coffee size={20} className={styles.coffeeIcon} />
              </div>
              <div className={styles.coffeeCtaText}>
                <div className={styles.coffeeCtaTitle}>Enjoying our free tools?</div>
                <div className={styles.coffeeCtaSub}>Buy us a coffee to support development</div>
              </div>
              <div className={styles.coffeeCtaAction}>
                <span>Support</span>
                <ExternalLink size={14} />
              </div>
            </a>

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => handleClose(false)}
                className={styles.skipBtn}
              >
                Done
              </button>
              <button
                type="button"
                onClick={handlePositiveSuggestionSubmit}
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Sending...' : 'Send Suggestion'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 3: DISLIKED / IMPROVEMENT FORM ── */}
        {state === 'disliked' && (
          <div className={styles.modalBodyForm}>
            <div className={styles.dislikeIconBadge}>
              <MessageSquare size={24} className={styles.dislikeIcon} />
            </div>
            <h2 className={styles.modalTitle}>What went wrong?</h2>
            <p className={styles.modalSubtitle}>
              Help us fix this issue for you. Select any common problem or type below:
            </p>

            {/* Quick chips with Lucide check icon */}
            <div className={styles.chipsContainer}>
              {COMMON_DISLIKE_ISSUES.map((issue) => {
                const active = selectedChips.includes(issue);
                return (
                  <button
                    key={issue}
                    type="button"
                    className={`${styles.chipBtn} ${active ? styles.activeChip : ''}`}
                    onClick={() => toggleDislikeChip(issue)}
                  >
                    {active && <Check size={13} className={styles.chipCheckIcon} />}
                    {issue}
                  </button>
                );
              })}
            </div>

            <textarea
              className={styles.textarea}
              placeholder="Tell us what didn't work or what feature you need... (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              autoFocus
            />

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={styles.skipBtn}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleReasonSubmit}
                disabled={isSubmitting}
                className={styles.submitBtn}
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 4: SUBMITTED SUCCESS ── */}
        {state === 'submitted' && (
          <div className={styles.modalBodySuccess}>
            <div className={styles.successIconBadge}>
              <Check size={32} className={styles.checkIcon} />
            </div>
            <h3 className={styles.successTitle}>Thank You!</h3>
            <p className={styles.successSubtitle}>
              Your feedback has been saved. We appreciate your help making our tools better!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
