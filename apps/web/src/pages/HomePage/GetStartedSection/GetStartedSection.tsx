import "./GetStartedSection.css";
import { useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  Cpu,
  ExternalLink,
  Palette,
  Save,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const DOCS_URL =
  "https://github.com/BrayanGuti/ChessMaster/blob/master/packages/react-chessmaster/README.md";
const NPM_URL = "https://www.npmjs.com/package/@brayanguti/react-chessmaster";

interface Step {
  title: string;
  description: string;
  command: string;
}

interface Guide {
  icon: LucideIcon;
  title: string;
  description: string;
  snippet: string;
}

const STEPS: Step[] = [
  {
    title: "Install the package",
    description: "Add it to any React 18 or 19 project. No stylesheet to import.",
    command: "npm install @brayanguti/react-chessmaster",
  },
  {
    title: "Import the board",
    description:
      "Render <ChessBoard /> in a container with a size; it fills it and stays square.",
    command:
      "import { ChessBoard } from '@brayanguti/react-chessmaster'",
  },
  {
    title: "Play the computer",
    description: "Pick the computer's color and level (1 to 5).",
    command: "<ChessBoard opponent={{ color: 'B', level: 3 }} />",
  },
];

const PROPS = [
  { command: "showMoveHistory", description: "Move list panel" },
  { command: "showCapturedPieces", description: "Captures and material" },
  { command: "showPlayerBadges", description: "Avatars and names" },
  { command: "modes", description: "Local, computer or both" },
];

const GUIDES: Guide[] = [
  {
    icon: Palette,
    title: "Make It Yours",
    description:
      "Switch between light and dark schemes and recolor squares, highlights and accent. Players can also toggle the scheme from the board.",
    snippet: "theme={{ accent: '#b58863' }}",
  },
  {
    icon: Cpu,
    title: "Bring Your Engine",
    description:
      "Plug in any engine: get the position in FEN, return a move in UCI. Illegal answers fall back to a random legal move.",
    snippet: "opponent={{ getMove: async (fen) => 'e2e4' }}",
  },
  {
    icon: Save,
    title: "Save & Listen",
    description:
      "Keep each board's game in localStorage and react to moves, resets and the end of the game with callbacks.",
    snippet: "persist=\"my-game\" onGameEnd={(r) => r.winner}",
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
              Add a complete chess board to your React app in less than a
              minute: two players or vs Computer, every rule included.
            </p>

            <div className="HomePage-GetStartedSection-links">
              <a
                className="HomePage-GetStartedSection-link HomePage-GetStartedSection-link--primary"
                href={DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the docs
                <ExternalLink />
              </a>
              <a
                className="HomePage-GetStartedSection-link"
                href={NPM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                npm package
                <ExternalLink />
              </a>
            </div>

            <div className="HomePage-GetStartedSection-scripts">
              <span className="HomePage-GetStartedSection-scripts-title">
                Useful props
              </span>
              <ul className="HomePage-GetStartedSection-scripts-list">
                {PROPS.map((script) => (
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
          {GUIDES.map(({ icon: Icon, title, description, snippet }) => (
            <article key={title} className="HomePage-GetStartedSection-guide">
              <span className="HomePage-GetStartedSection-corner" />
              <Icon className="HomePage-GetStartedSection-guide-icon" />
              <h3 className="HomePage-GetStartedSection-guide-title">
                {title}
              </h3>
              <p className="HomePage-GetStartedSection-guide-description">
                {description}
              </p>
              <code className="HomePage-GetStartedSection-guide-snippet">
                {snippet}
              </code>
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
