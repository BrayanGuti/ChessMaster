import styles from './ChessSettings.module.css';
import { useEffect, useId, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import type { ChessDisplaySettings } from '../store/types';

const OPTIONS: Array<{ key: keyof ChessDisplaySettings; label: string; hint: string }> = [
  { key: 'playerBadges', label: 'Players', hint: 'Photos and names' },
  { key: 'capturedPieces', label: 'Captured pieces', hint: 'Material gained' },
  { key: 'moveHistory', label: 'History', hint: 'Move list' },
];

export function ChessSettings({
  settings,
  onChange,
}: {
  settings: ChessDisplaySettings;
  onChange: (update: (previous: ChessDisplaySettings) => ChessDisplaySettings) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = (key: keyof ChessDisplaySettings) =>
    onChange((previous) => ({ ...previous, [key]: !previous[key] }));

  const isBoardOnly = !settings.playerBadges && !settings.capturedPieces && !settings.moveHistory;

  const setBoardOnly = () =>
    onChange((previous) => ({
      ...previous,
      playerBadges: isBoardOnly,
      capturedPieces: isBoardOnly,
      moveHistory: isBoardOnly,
    }));

  return (
    <div ref={rootRef} className={styles.settings}>
      <button
        type="button"
        className={`${styles.trigger}${open ? ` ${styles.triggerOpen}` : ''}`}
        aria-label="Board settings"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Settings size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div id={menuId} className={styles.menu} role="menu">
          <div className={styles.menuTitle}>Show</div>
          {OPTIONS.map(({ key, label, hint }) => (
            <button
              key={key}
              type="button"
              role="menuitemcheckbox"
              aria-checked={settings[key]}
              className={styles.option}
              onClick={() => toggle(key)}
            >
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>{label}</span>
                <span className={styles.optionHint}>{hint}</span>
              </span>
              <span className={styles.switch} aria-hidden="true">
                <span className={styles.knob} />
              </span>
            </button>
          ))}
          <div className={styles.divider} />
          <button type="button" role="menuitem" className={styles.action} onClick={setBoardOnly}>
            {isBoardOnly ? 'Show all' : 'Board only'}
          </button>
        </div>
      )}
    </div>
  );
}
