import styles from './MoveHistory.module.css';
import { useEffect, useRef } from 'react';
import { useChessStore } from '../store/useChessStore';
import { MoveRecord } from '../store/types';

interface MoveRow {
  turnNumber: number;
  white?: MoveRecord;
  black?: MoveRecord;
}

function groupByTurn(moveHistory: MoveRecord[]): MoveRow[] {
  const rows: MoveRow[] = [];

  moveHistory.forEach((record) => {
    const isWhiteMove = record.piece[0] === 'W';
    let row = rows.find((r) => r.turnNumber === record.turnNumber);

    if (!row) {
      row = { turnNumber: record.turnNumber };
      rows.push(row);
    }

    if (isWhiteMove) {
      row.white = record;
    } else {
      row.black = record;
    }
  });

  return rows;
}

export function MoveHistory({ className }: { className?: string }) {
  const moveHistory = useChessStore((state) => state.moveHistory);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = groupByTurn(moveHistory);
  const lastMove = moveHistory[moveHistory.length - 1];

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [moveHistory.length]);

  const moveClass = (record?: MoveRecord) =>
    `${styles.move}${record && record === lastMove ? ` ${styles.lastMove}` : ''}`;

  return (
    <div className={`${styles.moveHistory}${className ? ` ${className}` : ''}`}>
      <div className={styles.title}>Movimientos</div>
      <div ref={scrollRef} className={styles.scrollArea}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.turnHeader}>#</th>
              <th>
                <span className={`${styles.swatch} ${styles.swatchWhite}`} aria-hidden="true" />
                Blancas
              </th>
              <th>
                <span className={`${styles.swatch} ${styles.swatchBlack}`} aria-hidden="true" />
                Negras
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.empty}>
                  Aún no hay movimientos
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.turnNumber}>
                  <td className={styles.turnNumber}>{row.turnNumber}.</td>
                  <td>
                    <span className={moveClass(row.white)}>{row.white?.notation ?? ''}</span>
                  </td>
                  <td>
                    <span className={moveClass(row.black)}>{row.black?.notation ?? ''}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
