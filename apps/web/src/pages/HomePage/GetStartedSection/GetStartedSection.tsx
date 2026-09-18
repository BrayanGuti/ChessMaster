import "./GetStartedSection.css";
import { useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  Crown,
  MousePointerClick,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  title: string;
  description: string;
  command: string;
}

interface Guide {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    title: "Clone the repository",
    description: "Grab a local copy of the source code from GitHub.",
    command: "git clone https://github.com/BrayanGuti/ChessMaster.git",
  },
  {
    title: "Install dependencies",
    description: "Move into the project folder and install the packages.",
    command: "cd ChessMaster && npm install",
  },
  {
    title: "Start the dev server",
    description: "Launch Vite and open http://localhost:5173 in your browser.",
    command: "npm run dev",
  },
];

const SCRIPTS = [
  { command: "npm run build", description: "Production build" },
  { command: "npm run lint", description: "Code quality check" },
  { command: "npm run preview", description: "Preview the build" },
];

const GUIDES: Guide[] = [
  {
    icon: MousePointerClick,
    title: "How to Play",
    description:
      "Click a piece to highlight its legal moves, then click a target square. White moves first and turns alternate automatically.",
  },
  {
    icon: Crown,
    title: "Special Moves",
    description:
      "Castling, en passant and pawn promotion are fully supported. Reach the last rank to crown your pawn.",
  },
  {
    icon: ShieldAlert,
    title: "Check & Mate",
    description:
      "Check and checkmate are detected after every move, and only moves that keep your king safe are allowed.",
  },
];

export function GetStartedSection() {
  return (
    <section id="get-started" className="HomePage-GetStartedSection-section">
      <div className="HomePage-GetStartedSection-container">
        <div className="HomePage-GetStartedSection-top">
          <div className="HomePage-GetStartedSection-intro">
            <span className="HomePage-GetStartedSection-label">
              <BookOpen className="HomePage-GetStartedSection-label-icon" />
              Documentation
            </span>
            <h2 className="HomePage-GetStartedSection-title">
              Get
              <br />
              Started
            </h2>
            <p className="HomePage-GetStartedSection-description">
              Run ChessMaster on your machine in less than a minute. A local
              two-player chess game built with React, TypeScript and Zustand.
            </p>

            <div className="HomePage-GetStartedSection-scripts">
              <span className="HomePage-GetStartedSection-scripts-title">
                Other scripts
              </span>
              <ul className="HomePage-GetStartedSection-scripts-list">
                {SCRIPTS.map((script) => (
                  <li key={script.command}>
                    <code>{script.command}</code>
                    <span>{script.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ol className="HomePage-GetStartedSection-steps">
            {STEPS.map((step, index) => (
              <li key={step.title} className="HomePage-GetStartedSection-step">
                <span className="HomePage-GetStartedSection-step-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="HomePage-GetStartedSection-step-body">
                  <h3 className="HomePage-GetStartedSection-step-title">
                    {step.title}
                  </h3>
                  <p className="HomePage-GetStartedSection-step-description">
                    {step.description}
                  </p>
                  <CodeBlock command={step.command} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="HomePage-GetStartedSection-guides">
          {GUIDES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="HomePage-GetStartedSection-guide">
              <span className="HomePage-GetStartedSection-corner" />
              <Icon className="HomePage-GetStartedSection-guide-icon" />
              <h3 className="HomePage-GetStartedSection-guide-title">
                {title}
              </h3>
              <p className="HomePage-GetStartedSection-guide-description">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const COPIED_FEEDBACK_MS = 1600;

function CodeBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // El portapapeles puede no estar disponible (p. ej. contexto no seguro)
    }
  };

  return (
    <div className="HomePage-GetStartedSection-code">
      <Terminal className="HomePage-GetStartedSection-code-icon" />
      <code className="HomePage-GetStartedSection-code-text">{command}</code>
      <button
        type="button"
        className="HomePage-GetStartedSection-copy-button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy command"}
      >
        {copied ? <Check /> : <Copy />}
      </button>
    </div>
  );
}
