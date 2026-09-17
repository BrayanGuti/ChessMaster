import './Main.css';
import { ChessBoard } from '../../../components/Chess/ChessBoard/ChessBoard';

export function Main() {
  return (
    <main className="HomePage-Main-main">
      <div className="HomePage-Main-hero-container">
        <div className="HomePage-Main-hero-title-split">
          <h1 className="HomePage-Main-hero-title-left">MASTER</h1>
          <h1 className="HomePage-Main-hero-title-right">CHESS</h1>
        </div>
        <div className="HomePage-Main-hero-content">
          <div className="HomePage-Main-hero-left">
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
          </div>
          <div className="HomePage-Main-hero-right">
            <button className="HomePage-Main-play-button">
              Play Now <span className="HomePage-Main-arrow">→</span>
            </button>
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
