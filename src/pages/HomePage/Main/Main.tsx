import './Main.css';
import { ChessBoard } from '../../../components/Chess/ChessBoard/ChessBoard';

export function Main() {
  return (
    <main className="HomePage-Main-main">
      <div className="HomePage-Main-hero-container">
        <div className="HomePage-Main-hero-content">
          <div className="HomePage-Main-hero-left">
            <h1 className="HomePage-Main-hero-title">MASTER AI<br />CHESS</h1>
            <p className="HomePage-Main-hero-description">
              Transform your AI chess vision into true mastery with intelligent, results-focused strategy.
            </p>
            <div className="HomePage-Main-features">
              <div className="HomePage-Main-feature">
                <span className="HomePage-Main-feature-number">01/</span>
                <span className="HomePage-Main-feature-text">AI POWERED TRAINING</span>
              </div>
              <div className="HomePage-Main-feature">
                <span className="HomePage-Main-feature-number">02/</span>
                <span className="HomePage-Main-feature-text">COMPETITIVE RANKINGS</span>
              </div>
            </div>
            <button className="HomePage-Main-play-button">
              Play Now <span className="HomePage-Main-arrow">→</span>
            </button>
          </div>
          <div className="HomePage-Main-hero-right">
            <div className="HomePage-Main-board">
              <div className="HomePage-Main-board-wrapper">
                <div className="HomePage-Main-board-container">
                  <div className="HomePage-Main-board-content">
                    <ChessBoard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
