import './Main.css';
import { ChessBoard } from '../../../components/Chess/ChessBoard/ChessBoard';

export function Main() {
  return (
    <main className="HomePage-Main-main">
      <div className="HomePage-Main-container">
        <div className="HomePage-Main-content">
          <div className="HomePage-Main-grid">
            <div className="HomePage-Main-info">
              <div className="HomePage-Main-card">
                <h2 className="HomePage-Main-title">Welcome to ChessMaster</h2>
                <p className="HomePage-Main-description">
                  This game has been built without using libraries that simplify chess logic, ensuring a unique and personalized experience. Developed with React.js and powered by Zustand, it enables efficient global state management for a smooth and intuitive performance. Additionally, it features an optimized interface for an immersive user experience. Every move has been meticulously programmed to deliver dynamic and challenging matches.
                </p>
              </div>
            </div>
            <div className="HomePage-Main-info">
              <div className="HomePage-Main-card">
                <h2 className="HomePage-Main-title">Game Features</h2>
                <p className="HomePage-Main-description">
                  This chess project has been designed with precise logic, staying true to the real game by correctly implementing the following advanced rules:  
                  <br /><br />
                  ♟️ <strong>Castling</strong>: Protect your king and improve your position's safety.  
                  <br />
                  ⚔️ <strong>Check</strong>: Put the enemy king in trouble and force your opponent to react.  
                  <br />
                  🏆 <strong>Checkmate</strong>: Secure victory with a decisive move.  
                  <br />
                  👑 <strong>Pawn Promotion</strong>: Promote your pawn and give your game a strategic twist.  
                  <br />
                  Every detail has been meticulously programmed to provide an authentic and challenging experience!
                </p>
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
