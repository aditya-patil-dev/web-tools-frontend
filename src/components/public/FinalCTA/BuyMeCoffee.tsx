'use client';

import { useState, useEffect } from 'react';
import styles from './BuyMeCoffee.module.css';

interface BuyMeCoffeeProps {
  username?: string;
}

export default function BuyMeCoffee({ username = 'techfusion' }: BuyMeCoffeeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Trigger slide-up animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => setIsHidden(true), 400);
  };

  const createParticles = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const numParticles = 8;

    for (let i = 0; i < numParticles; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = styles.particle;

        const angle = (Math.PI * 2 * i) / numParticles;
        const distance = 40 + Math.random() * 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.left = '50%';
        particle.style.top = '50%';

        card.appendChild(particle);

        setTimeout(() => particle.remove(), 2000);
      }, i * 50);
    }
  };

  if (isHidden) return null;

  return (
    <div className={`${styles.coffeeWidget} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.coffeeCard}>
        <div className={styles.closeBtn} onClick={handleClose} />
        <div className={styles.glowPulse} />
        <a
          href={`https://www.buymeacoffee.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.coffeeCardInner}
          onMouseEnter={createParticles}
        >
          <div className={styles.coffeeIconWrapper}>
            <div className={styles.steamContainer}>
              <div className={styles.steam} />
              <div className={styles.steam} />
              <div className={styles.steam} />
            </div>
            <svg className={styles.coffeeIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3C5.44772 3 5 3.44772 5 4V5H4C3.44772 5 3 5.44772 3 6V8C3 8.55228 3.44772 9 4 9H5V17C5 18.6569 6.34315 20 8 20H16C17.6569 20 19 18.6569 19 17V9H20C20.5523 9 21 8.55228 21 8V6C21 5.44772 20.5523 5 20 5H19V4C19 3.44772 18.5523 3 18 3H6Z" fill="white" fillOpacity="0.9" />
              <ellipse cx="12" cy="5.5" rx="6" ry="1.5" fill="rgba(139, 69, 19, 0.3)" />
              <path d="M7 9C7 9 8 11 8 13C8 14.1046 8.89543 15 10 15C11.1046 15 12 14.1046 12 13C12 11 13 9 13 9" stroke="rgba(139, 69, 19, 0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 9C14 9 15 11 15 13C15 14.1046 15.8954 15 17 15" stroke="rgba(139, 69, 19, 0.3)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.coffeeText}>
            <div className={styles.coffeeMessage}>Enjoying this?</div>
            <div className={styles.coffeeCta}>Buy me a coffee</div>
          </div>
        </a>
      </div>
    </div>
  );
}