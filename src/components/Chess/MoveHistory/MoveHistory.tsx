import styles from './MoveHistory.module.css';
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
  const rows = groupByTurn(moveHistory);

  return (
    <div className={`${styles.moveHistory}${className ? ` ${className}` : ''}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.turnHeader}>#</th>
            <th>Blancas</th>
            <th>Negras</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.turnNumber}>
              <td className={styles.turnNumber}>{row.turnNumber}</td>
              <td>{row.white?.notation ?? ''}</td>
              <td>{row.black?.notation ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
