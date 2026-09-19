import styles from "./GameSection.module.css";
import { ChessBoard } from "@brayanguti/react-chessmaster";
import {
  Bot,
  Cpu,
  Layers,
  Palette,
  Users,
  Move,
  Maximize2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Fact {
  icon: LucideIcon;
  text: string;
}

const FEATURES: Feature[] = [
  {
    icon: Cpu,
    title: "Web Worker AI",
    description:
      "Play against the computer with 5 difficulty levels running smoothly in a background worker so the page never freezes.",
  },
  {
    icon: Move,
    title: "Drag & Drop",
    description:
      "Intuitive piece movement supporting mouse, touch, and pen interactions with move hints and smooth board flipping.",
  },
  {
    icon: Palette,
    title: "Themeable Design",
    description:
      "Easily customize board square colors, highlights, and light/dark panel schemes to fit your application perfectly.",
  },
];

const FACTS: Fact[] = [
  { icon: Bot, text: "5 AI difficulty levels" },
  { icon: Layers, text: "Move history & persistence" },
  { icon: Users, text: "Two players, same device" },
  { icon: Maximize2, text: "Fits any container" },
];

export function GameSection() {
  return (
    <section id="game" className={styles.gameSection}>
      <div className={styles.container}>
        <div className={styles.stage}>
          <div className={styles.game}>
            <ChessBoard
              persist
              showMoveHistory
              showCapturedPieces
              showPlayerBadges
            />
          </div>
        </div>

        <div className={styles.info}>
          <h2 className={styles.title}>
            <span className={styles.titleLine}>Master</span>{" "}
            <span className={styles.titleLine}>The Board</span>
          </h2>
          <p className={styles.description}>
            A complete, high-performance drop-in chess board for React.
            Challenge a friend locally or test your skills against the computer
            with a fluid, lag-free experience.
          </p>

          <ul className={styles.features}>
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className={styles.feature}>
                <span className={styles.corner} />
                <Icon className={styles.featureIcon} />
                <div className={styles.featureBody}>
                  <h3 className={styles.featureTitle}>{title}</h3>
                  <p className={styles.featureDescription}>{description}</p>
                </div>
              </li>
            ))}
          </ul>

          <ul className={styles.facts}>
            {FACTS.map(({ icon: Icon, text }) => (
              <li key={text} className={styles.fact}>
                <Icon className={styles.factIcon} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
