import "./HeroSection.css";

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
              Transform your AI chess vision into true mastery with intelligent,
              results-focused strategy.
            </p>
            <div className="HomePage-HeroSection-features">
              <div className="HomePage-HeroSection-feature">
                <span className="HomePage-HeroSection-feature-number">01/</span>
                <span className="HomePage-HeroSection-feature-text">
                  AI POWERED TRAINING
                </span>
              </div>
              <div className="HomePage-HeroSection-feature">
                <span className="HomePage-HeroSection-feature-number">02/</span>
                <span className="HomePage-HeroSection-feature-text">
                  COMPETITIVE RANKINGS
                </span>
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
