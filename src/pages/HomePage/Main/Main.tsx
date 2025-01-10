import './Main.css';
import { ChessBoard } from '../../../components/Chess/ChessBoard/ChessBoard';
import { Trophy, Clock, Users } from 'lucide-react';

export function Main() {
  return (
    <main className="HomePage-Main-main">
      <div className="HomePage-Main-container">
        <div className="HomePage-Main-content">
          <div className="HomePage-Main-grid">
            <div className="HomePage-Main-info">
              <div className="HomePage-Main-card">
                <h1 className="HomePage-Main-title">Welcome to ChessMaster</h1>
                <p className="HomePage-Main-description">
                  Play chess online, improve your strategy, and join our growing community of players.
                </p>
                <div className="HomePage-Main-stats-grid">
                  {[
                    { icon: Trophy, label: 'Tournaments', value: 'Daily' },
                    { icon: Clock, label: 'Game Modes', value: 'Multiple' },
                    { icon: Users, label: 'Players', value: '10,000+' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="HomePage-Main-stat">
                      <Icon className="HomePage-Main-stat-icon" />
                      <div className="HomePage-Main-stat-label">{label}</div>
                      <div className="HomePage-Main-stat-value">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="HomePage-Main-board">
            <div className="HomePage-Main-board-wrapper">
              <div className="HomePage-Main-board-container">
                <div className="HomePage-Main-board-content">
                  <ChessBoard />
                </div>
                <div className="HomePage-Main-board-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
