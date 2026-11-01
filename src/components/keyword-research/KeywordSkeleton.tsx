// src/components/keyword-research/KeywordSkeleton.tsx
"use client";

import styles from "./KeywordSkeleton.module.css";

const SKELETON_ROWS = [
  { kwWidth: "75%", pillWidth: "70px", clusterWidth: "60px" },
  { kwWidth: "60%", pillWidth: "85px", clusterWidth: "50px" },
  { kwWidth: "85%", pillWidth: "80px", clusterWidth: "65px" },
  { kwWidth: "50%", pillWidth: "75px", clusterWidth: "55px" },
  { kwWidth: "70%", pillWidth: "90px", clusterWidth: "70px" },
  { kwWidth: "65%", pillWidth: "70px", clusterWidth: "60px" },
  { kwWidth: "80%", pillWidth: "85px", clusterWidth: "75px" },
  { kwWidth: "55%", pillWidth: "65px", clusterWidth: "50px" },
];

export default function KeywordSkeleton() {
  return (
    <div className={styles.skeletonWrap} aria-label="Loading keyword results...">
      {/* 1. Shimmering Metrics Bar */}
      <div className={styles.metricsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.metricCard}>
            <div className={`${styles.shimmerBox} ${styles.metricIcon}`} />
            <div className={styles.metricTexts}>
              <div className={`${styles.shimmerBox} ${styles.metricVal}`} />
              <div className={`${styles.shimmerBox} ${styles.metricLbl}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Shimmering Filter Chips */}
      <div className={styles.chipsRow}>
        {[80, 110, 100, 95, 115, 85, 90].map((width, idx) => (
          <div
            key={idx}
            className={`${styles.shimmerBox} ${styles.chip}`}
            style={{ width: `${width}px` }}
          />
        ))}
      </div>

      {/* 3. Shimmering Summary Row */}
      <div className={styles.summaryRow}>
        <div className={`${styles.shimmerBox} ${styles.summaryText}`} />
        <div className={`${styles.shimmerBox} ${styles.summaryBtn}`} />
      </div>

      {/* 4. Shimmering Results Table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <div className={`${styles.shimmerBox} ${styles.headerCell}`} />
          <div className={`${styles.shimmerBox} ${styles.headerCell}`} />
          <div className={`${styles.shimmerBox} ${styles.headerCell}`} />
          <div className={`${styles.shimmerBox} ${styles.headerCell}`} />
          <div className={`${styles.shimmerBox} ${styles.headerCell}`} />
          <div className={`${styles.shimmerBox} ${styles.headerCell}`} />
        </div>

        {SKELETON_ROWS.map((row, idx) => (
          <div key={idx} className={styles.tableRow}>
            {/* Keyword cell */}
            <div className={styles.cellKw}>
              <div className={`${styles.shimmerBox} ${styles.cellIcon}`} />
              <div
                className={`${styles.shimmerBox} ${styles.cellText}`}
                style={{ width: row.kwWidth }}
              />
            </div>
            {/* Intent cell */}
            <div>
              <div
                className={`${styles.shimmerBox} ${styles.cellPill}`}
                style={{ width: row.pillWidth }}
              />
            </div>
            {/* Cluster cell */}
            <div>
              <div
                className={`${styles.shimmerBox} ${styles.cellPill}`}
                style={{ width: row.clusterWidth }}
              />
            </div>
            {/* Word count cell */}
            <div>
              <div
                className={`${styles.shimmerBox} ${styles.cellText}`}
                style={{ width: "35px" }}
              />
            </div>
            {/* Source cell */}
            <div>
              <div
                className={`${styles.shimmerBox} ${styles.cellPill}`}
                style={{ width: "65px" }}
              />
            </div>
            {/* Metrics status cell */}
            <div>
              <div
                className={`${styles.shimmerBox} ${styles.cellPill}`}
                style={{ width: "95px" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
