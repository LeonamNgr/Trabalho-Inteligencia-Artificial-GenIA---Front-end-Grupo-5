import { useState } from 'react';
import type { Source } from '../../types/message';
import styles from './SourcePanel.module.css';

interface SourcePanelProps {
  sources: Source[];
  maxVisible?: number;
}

export function SourcePanel({ sources, maxVisible = 3 }: SourcePanelProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!sources?.length) return null;

  const visible = expanded ? sources : sources.slice(0, maxVisible);
  const remaining = sources.length - maxVisible;

  return (
    <div className={styles.panel}>
      <button
        className={styles.header}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>Fontes utilizadas ({sources.length})</span>
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>&#9654;</span>
      </button>

      {open && (
        <div className={styles.body}>
          {visible.map((source) => (
            <div key={source.id} className={styles.item}>
              <div className={styles.itemTitle}>
                <span className={styles.bullet}>&#128205;</span>
                <span>{source.title}</span>
              </div>
              <p className={styles.excerpt}>{source.excerpt}</p>
              {source.relevance !== undefined && (
                <div className={styles.relevanceRow}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${source.relevance * 100}%` }}
                    />
                  </div>
                  <span className={styles.relevanceLabel}>
                    {Math.round(source.relevance * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
          {!expanded && remaining > 0 && (
            <button
              className={styles.showMore}
              onClick={() => setExpanded(true)}
            >
              +{remaining} mais
            </button>
          )}
        </div>
      )}
    </div>
  );
}
