import styles from './ChessSettings.module.css';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChessDisplaySettings } from '../store/types';

// "Settings" icon from Lucide (ISC license), inlined so the package has no icon dependency
function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

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
        <GearIcon />
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
