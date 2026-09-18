import "./HeroSection.css";
import { scrollToSection } from "../scrollToSection";

export function HeroSection() {
  return (
    <main className="HomePage-HeroSection-main">
      <div className="HomePage-HeroSection-hero-container">
        <div className="HomePage-HeroSection-hero-wrapper">
          <div className="HomePage-HeroSection-hero-left-section">
            <h1 className="HomePage-HeroSection-hero-title-top">
              CHESS MASTER
            </h1>
            <p className="HomePage-HeroSection-hero-description">
              A complete, open-source chess board for React. Install it from npm
              and drop a fully playable game into your app.
            </p>
            <button
              className="HomePage-HeroSection-play-button"
              onClick={() => scrollToSection("game")}
            >
              Play Now
              <span className="HomePage-HeroSection-arrow">→</span>
            </button>
            <div className="HomePage-HeroSection-brand">
              <div className="HomePage-HeroSection-brand-side">
                <div className="HomePage-HeroSection-brand-line-wrapper">
                  <div className="HomePage-HeroSection-brand-line"></div>
                </div>
                <div className="HomePage-HeroSection-brand-grid">
                  <span className="HomePage-HeroSection-grid-cell HomePage-HeroSection-grid-cell-filled"></span>
                  <span className="HomePage-HeroSection-grid-cell"></span>
                  <span className="HomePage-HeroSection-grid-cell"></span>
                  <span className="HomePage-HeroSection-grid-cell HomePage-HeroSection-grid-cell-filled"></span>
                  <span className="HomePage-HeroSection-grid-cell HomePage-HeroSection-grid-cell-filled"></span>
                  <span className="HomePage-HeroSection-grid-cell"></span>
                </div>
              </div>
              <div className="HomePage-HeroSection-brand-text">
                <h2 className="HomePage-HeroSection-brand-title">
                  LOGIC.
                  <br />
                  FOCUS.
                  <br />
                  VICTORY.
                </h2>
                <p className="HomePage-HeroSection-brand-subtitle">
                  Every Move Shapes Your Mind.
                </p>
              </div>
            </div>
          </div>
          <div className="HomePage-HeroSection-hero-right-section">
            <img
              className="HomePage-HeroSection-horse-image"
              src="/horse-pice.png"
              alt="Chess Knight"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
