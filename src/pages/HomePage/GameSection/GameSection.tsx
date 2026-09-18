import styles from "./GameSection.module.css";
import { ChessBoard } from "../../../components/Chess";
import {
  Crown,
  LayoutGrid,
  Maximize2,
  Move,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Volume2,
  Webhook,
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
    icon: ShieldCheck,
    title: "Complete Rules",
    description:
      "Only legal moves are allowed, with check, checkmate and stalemate detected.",
  },
  {
    icon: Crown,
    title: "Special Moves",
    description:
      "Castling, en passant and pawn promotion to queen, rook, bishop or knight.",
  },
  {
    icon: Move,
    title: "Click or Drag",
    description:
      "Tap a piece to see its moves or drag it to a square, with mouse or touch.",
  },
  {
    icon: SlidersHorizontal,
    title: "Your Layout",
    description:
      "Use the gear to toggle players, captured pieces and the move history.",
  },
];

const FACTS: Fact[] = [
  { icon: Users, text: "2 players, same device" },
  { icon: Zap, text: "White moves first" },
  { icon: Volume2, text: "Sound on every move" },
];

export function GameSection() {
  return (
    <section id="game" className={styles.gameSection}>
      <div className={styles.container}>
        <div className={styles.game}>
          <ChessBoard showMoveHistory showCapturedPieces showPlayerBadges />
        </div>

        <div className={styles.info}>
          <h2 className={styles.title}>
            <span className={styles.titleLine}>Your</span>{" "}
            <span className={styles.titleLine}>Move</span>
          </h2>
          <p className={styles.description}>
            A classic match for two players on one screen. Check, checkmate and
            stalemate are detected on every move, and a new game is one click
            away.
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
