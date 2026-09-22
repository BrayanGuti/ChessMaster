import "./CreatorSection.css";
import { ArrowUpRight, Github, Inbox, Linkedin } from "lucide-react";

const SIDE_NAV = ["Developer", "Strategy", "Logic", "Chess"];
const STACK = ["React", "TypeScript", "Vite"];

// TODO: reemplazar por la URL real del portafolio
const PORTFOLIO_URL = "#";

export function CreatorSection() {
  return (
    <section id="creator" className="HomePage-CreatorSection-section">
      <div className="HomePage-CreatorSection-card">
        <nav className="HomePage-CreatorSection-side-nav">
          {SIDE_NAV.map((item) => (
            <span key={item} className="HomePage-CreatorSection-side-nav-item">
              {item}
            </span>
          ))}
        </nav>

        <div className="HomePage-CreatorSection-profile-column">
          <div className="HomePage-CreatorSection-tab">About Me</div>
          <div className="HomePage-CreatorSection-profile">
            <div className="HomePage-CreatorSection-avatar-ring">
              <div className="HomePage-CreatorSection-avatar">
                <img src="/profile-picture.jpeg" alt="Brayan Gutierrez" />
              </div>
            </div>

            <h2 className="HomePage-CreatorSection-name">
              <span className="HomePage-CreatorSection-name-intro">Im,</span>
              <span>Brayan</span>
              <span>Gutierrez</span>
            </h2>

            <a
              href="mailto:inquiry@brayangutierrez.com"
              className="HomePage-CreatorSection-email"
            >
              brayan.andres.gutierrez.pupo@gmail.com
              <Inbox className="HomePage-CreatorSection-email-icon" />
            </a>
          </div>
        </div>

        <div className="HomePage-CreatorSection-content">
          <h2 className="HomePage-CreatorSection-title">Creator</h2>

          <div className="HomePage-CreatorSection-grid">
            <div className="HomePage-CreatorSection-media">
              <span className="HomePage-CreatorSection-media-label">About</span>
              <p className="HomePage-CreatorSection-media-text">
                I'm a software developer passionate about building clean,
                intuitive web experiences. ChessMaster was born from my love for
                chess and code: a place where logic, focus and design meet. I
                enjoy turning complex rules into simple interfaces and I'm
                always learning something new along the way.
              </p>
            </div>

            <div className="HomePage-CreatorSection-stats">
              <a
                href="https://www.linkedin.com/in/brayan-gutierrez-b16048260/"
                target="_blank"
                rel="noopener noreferrer"
                className="HomePage-CreatorSection-stat HomePage-CreatorSection-stat-light"
              >
                <span className="HomePage-CreatorSection-corner" />
                <Linkedin className="HomePage-CreatorSection-stat-icon" />
                <strong>LinkedIn</strong>
                <span>Let's connect</span>
              </a>
              <a
                href="https://github.com/BrayanGuti"
                target="_blank"
                rel="noopener noreferrer"
                className="HomePage-CreatorSection-stat HomePage-CreatorSection-stat-dark"
              >
                <span className="HomePage-CreatorSection-corner HomePage-CreatorSection-corner-light" />
                <Github className="HomePage-CreatorSection-stat-icon" />
                <strong>GitHub</strong>
                <span>@BrayanGuti</span>
              </a>
            </div>

            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="HomePage-CreatorSection-portfolio"
            >
              <span className="HomePage-CreatorSection-portfolio-arrow">
                <ArrowUpRight />
              </span>
              <span className="HomePage-CreatorSection-portfolio-label">
                Portfolio
              </span>
              <strong>My Work</strong>
            </a>

            <div className="HomePage-CreatorSection-motto">
              <span className="HomePage-CreatorSection-motto-label">
                Built with
              </span>
              <p className="HomePage-CreatorSection-motto-text">
                Every move is a line of code.
              </p>
              <ul className="HomePage-CreatorSection-motto-stack">
                {STACK.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
