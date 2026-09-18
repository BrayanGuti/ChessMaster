import styles from "./GameSection.module.css";
import { ChessBoard } from "../../../components/Chess";
import {
  LayoutGrid,
  Maximize2,
  Move,
  Palette,
  Users,
  Volume2,
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
    icon: Move,
    title: "Click or Drag",
    description:
      "Tap a piece to see its moves or drag it to a square, with mouse or touch.",
  },
  {
    icon: Palette,
    title: "Your Colors",
    description: "Restyle the board and its panels with a single theme prop.",
  },
  {
    icon: LayoutGrid,
    title: "Many Boards",
    description: "Run several independent games side by side on the same page.",
  },
];

const FACTS: Fact[] = [
  { icon: Users, text: "2 players, same device" },
  { icon: Maximize2, text: "Fits any container" },
  { icon: Volume2, text: "Sound on every move" },
];

export function GameSection() {
  return (
    <section id="game" className={styles.gameSection}>
      <div className={styles.container}>
        <div className={styles.game}>
          <ChessBoard persist showMoveHistory showCapturedPieces showPlayerBadges />
        </div>

        <div className={styles.info}>
          <h2 className={styles.title}>
            <span className={styles.titleLine}>Your</span>{" "}
            <span className={styles.titleLine}>Move</span>
          </h2>
          <p className={styles.description}>
            A drop-in chess board for React, playable right here. Challenge a
            friend on one screen, and start a new game in one click when the
            match ends.
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
