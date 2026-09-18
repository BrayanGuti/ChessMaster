import "./Footer.css";
import { ArrowUpRight, Github, Linkedin, Code } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { scrollToSection } from "../scrollToSection";

interface SectionLink {
  targetId: string;
  label: string;
}

interface ExternalLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const SECTIONS: SectionLink[] = [
  { targetId: "game", label: "Play" },
  { targetId: "get-started", label: "Get started" },
  { targetId: "creator", label: "Creator" },
];

const EXTERNAL: ExternalLink[] = [
  {
    href: "https://github.com/BrayanGuti/ChessMaster",
    label: "Code Base",
    icon: Code,
  },
  { href: "https://github.com/BrayanGuti", label: "GitHub", icon: Github },
  {
    href: "https://www.linkedin.com/in/brayan-gutierrez-b16048260/",
    label: "LinkedIn",
    icon: Linkedin,
  },
];

// Mismo patrón de 2x3 que la marca del Hero (true = celda rellena)
const GRID_PATTERN = [true, false, false, true, true, false];

export function Footer() {
  return (
    <footer className="HomePage-Footer-footer">
      <div className="HomePage-Footer-container">
        <div className="HomePage-Footer-columns">
          <div className="HomePage-Footer-column HomePage-Footer-brand">
            <div className="HomePage-Footer-grid" aria-hidden="true">
              {GRID_PATTERN.map((filled, index) => (
                <span
                  key={index}
                  className={
                    filled
                      ? "HomePage-Footer-grid-cell HomePage-Footer-grid-cell-filled"
                      : "HomePage-Footer-grid-cell"
                  }
                />
              ))}
            </div>
            <div>
              <h2 className="HomePage-Footer-wordmark">Chess Master</h2>
              <p className="HomePage-Footer-tagline">
                Every move is a line of code.
              </p>
            </div>
          </div>

          <nav className="HomePage-Footer-column" aria-label="Sections">
            <span className="HomePage-Footer-plus" aria-hidden="true">
              +
            </span>
            <span className="HomePage-Footer-label">Navigate</span>
            <ul className="HomePage-Footer-list">
              {SECTIONS.map(({ targetId, label }) => (
                <li key={targetId}>
                  <a
                    href={`#${targetId}`}
                    className="HomePage-Footer-link"
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(targetId);
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="HomePage-Footer-column" aria-label="External links">
            <span className="HomePage-Footer-plus" aria-hidden="true">
              +
            </span>
            <span className="HomePage-Footer-label">Connect</span>
            <ul className="HomePage-Footer-list">
              {EXTERNAL.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="HomePage-Footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="HomePage-Footer-link-icon" />
                    {label}
                    <ArrowUpRight className="HomePage-Footer-link-arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="HomePage-Footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} ChessMaster by BrayanGuti
          </span>
        </div>
      </div>
    </footer>
  );
}
