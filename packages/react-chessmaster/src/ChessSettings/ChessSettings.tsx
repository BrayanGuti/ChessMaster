import styles from './ChessSettings.module.css';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChessDisplaySettings } from '../store/types';

type ColorScheme = 'dark' | 'light';

// Icons inlined so the package has no icon dependency; authors and licenses (CC BY) in THIRD_PARTY_LICENSES.md

// "Settings" by Solar Icons
function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5M9.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0" />
      <path fillRule="evenodd" clipRule="evenodd" d="M11.97 1.25q-.66 0-1.12.02t-.9.19c-.68.28-1.21.81-1.5 1.49q-.2.52-.19 1.12a.9.9 0 0 1-.42.73.9.9 0 0 1-.84 0q-.52-.3-1.07-.4c-.72-.09-1.45.1-2.03.55q-.36.3-.62.7-.25.38-.58.95l-.02.05q-.34.56-.54.98-.22.42-.3.88c-.09.72.1 1.45.55 2.03q.35.43.87.73.43.29.43.73t-.43.73q-.52.3-.87.73a2.8 2.8 0 0 0-.54 2.03q.07.46.29.88.2.42.54.98l.02.05.58.96q.26.4.62.69c.58.44 1.3.64 2.03.54Q6.5 19.5 7 19.2c.29-.15.6-.14.84 0q.38.22.42.73 0 .6.2 1.12c.28.68.81 1.21 1.49 1.5q.44.16.9.18t1.12.02h.06q.66 0 1.12-.02t.9-.19a2.8 2.8 0 0 0 1.5-1.49q.2-.52.19-1.12c.01-.32.18-.6.42-.73a.9.9 0 0 1 .84 0q.52.3 1.07.4c.72.09 1.45-.1 2.03-.55q.36-.3.62-.7.25-.38.58-.95l.02-.05q.34-.56.54-.98.22-.42.3-.88c.09-.72-.1-1.45-.55-2.03q-.35-.43-.87-.73a.9.9 0 0 1-.43-.73c0-.28.15-.55.43-.73q.52-.3.87-.73c.44-.58.64-1.31.54-2.03q-.07-.46-.29-.88-.2-.41-.54-.98l-.02-.05-.58-.96q-.26-.4-.62-.69a2.8 2.8 0 0 0-2.03-.54q-.56.09-1.07.39a.9.9 0 0 1-.84 0 .9.9 0 0 1-.42-.73q0-.6-.2-1.12a2.8 2.8 0 0 0-1.49-1.5 3 3 0 0 0-.9-.18q-.46-.03-1.12-.02zm-1.45 1.6q.1-.06.44-.08T12 2.75t1.04.02.44.08c.3.12.55.37.67.67.04.1.08.25.1.6a2.33 2.33 0 0 0 3.45 2c.31-.17.46-.21.57-.23.32-.04.66.05.92.25q.1.06.28.34.2.29.54.9.35.59.5.9t.16.42q.05.51-.25.93c-.06.08-.18.18-.48.37a2.4 2.4 0 0 0-1.13 2c0 .84.46 1.57 1.13 2 .3.19.42.29.48.37q.31.42.25.93 0 .1-.15.41c-.11.23-.27.5-.5.91-.25.42-.4.7-.55.9q-.18.28-.28.34c-.26.2-.6.29-.93.25-.1-.02-.25-.06-.56-.23-.7-.37-1.57-.4-2.3.02a2.4 2.4 0 0 0-1.16 1.97 2 2 0 0 1-.09.6q-.2.48-.67.68c-.08.04-.2.07-.44.08q-.34.02-1.04.02t-1.04-.02a1 1 0 0 1-.44-.08c-.3-.12-.55-.37-.67-.67-.04-.1-.08-.25-.1-.6A2.4 2.4 0 0 0 8.6 17.9a2.3 2.3 0 0 0-2.29-.02 2 2 0 0 1-.57.23c-.32.04-.66-.05-.92-.25a1 1 0 0 1-.28-.34q-.2-.29-.54-.9-.35-.59-.5-.9t-.16-.42q-.06-.51.25-.93c.06-.08.18-.18.48-.37a2.4 2.4 0 0 0 1.13-2c0-.84-.46-1.57-1.13-2-.3-.19-.42-.29-.48-.37q-.31-.42-.25-.93 0-.1.15-.41c.11-.23.27-.5.5-.92.25-.4.4-.68.55-.89q.18-.28.28-.34c.26-.2.6-.29.93-.25.1.02.25.06.56.23.7.37 1.57.4 2.3-.02a2.4 2.4 0 0 0 1.16-1.97c.01-.36.05-.51.09-.6q.2-.48.67-.68" />
    </svg>
  );
}

// "Sun" by Dazzle UI
function SunIcon() {
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
      <path d="M12 3v1m0 16v1m-8-9H3m3.31-5.69L5.5 5.5m12.19.81.81-.81M6.31 17.69l-.81.81m12.19-.81.81.81M21 12h-1m-4 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0" />
    </svg>
  );
}

// "Dark mode night moon" by nickylimyeanfen
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 35 35" fill="currentColor" aria-hidden="true">
      <path d="M18.44 34.68a18 18 0 0 1-2.94-.24 18.2 18.2 0 0 1-15-20.86A18 18 0 0 1 9.59.63a2.4 2.4 0 0 1 2.61.16 2.4 2.4 0 0 1 1 2.41l-1.3-.1 1.23.22A15.66 15.66 0 0 0 23.34 21a16 16 0 0 0 8.47.53A2.44 2.44 0 0 1 34.47 25a18.2 18.2 0 0 1-16.03 9.68M10.67 2.89a15.67 15.67 0 0 0-5 22.77A15.66 15.66 0 0 0 32.18 24a18.5 18.5 0 0 1-9.65-.64A18.2 18.2 0 0 1 10.67 2.89" />
    </svg>
  );
}

const OPTIONS: Array<{ key: keyof ChessDisplaySettings; label: string; hint: string }> = [
  { key: 'playerBadges', label: 'Players', hint: 'Photos and names' },
  { key: 'capturedPieces', label: 'Captured pieces', hint: 'Material gained' },
  { key: 'moveHistory', label: 'History', hint: 'Move list' },
  { key: 'gamePanel', label: 'Game', hint: 'Mode, color and level' },
];

export function ChessSettings({
  settings,
  onChange,
  allowGamePanel = true,
  colorScheme,
  onColorSchemeChange,
}: {
  settings: ChessDisplaySettings;
  onChange: (update: (previous: ChessDisplaySettings) => ChessDisplaySettings) => void;
  /** False when the developer removed the Game panel (showGamePanel={false}): no switch for it */
  allowGamePanel?: boolean;
  colorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
}) {
  const options = allowGamePanel ? OPTIONS : OPTIONS.filter(({ key }) => key !== 'gamePanel');
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

  const isBoardOnly = options.every(({ key }) => !settings[key]);

  const setBoardOnly = () =>
    onChange((previous) => ({
      ...previous,
      ...Object.fromEntries(options.map(({ key }) => [key, isBoardOnly])),
    }));

  const isDark = colorScheme === 'dark';
  const schemeLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <div ref={rootRef} className={styles.settings}>
      {/* Shows the scheme it switches to: a sun in dark mode, a moon in light mode */}
      <button
        type="button"
        className={styles.trigger}
        aria-label={schemeLabel}
        title={schemeLabel}
        onClick={() => onColorSchemeChange(isDark ? 'light' : 'dark')}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

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
          {options.map(({ key, label, hint }) => (
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
