import "./CreditsSection.css";
import { Cpu, Crown, Shapes, Volume2, type LucideIcon } from "lucide-react";

type Row = { key: string; value: string };

type Credit = {
  icon: LucideIcon;
  label: string;
  name: string;
  href: string;
  rows: Row[];
  items?: { name: string; author: string; href: string }[];
};

const CREDITS: Credit[] = [
  {
    icon: Crown,
    label: "Chess pieces",
    name: "chess_svg_piece_sets",
    href: "https://github.com/kmar/chess_svg_piece_sets",
    rows: [
      { key: "Author", value: "Martin Sedlák" },
      { key: "License", value: "CC0 · Public domain" },
      { key: "Changes", value: "SVGO + viewBox" },
    ],
  },
  {
    icon: Cpu,
    label: "Computer opponent",
    name: "js-chess-engine",
    href: "https://github.com/josefjadrny/js-chess-engine",
    rows: [
      { key: "Author", value: "Josef Jadrny" },
      { key: "License", value: "MIT" },
      { key: "Runs in", value: "Web Worker, bundled" },
    ],
  },
  {
    icon: Volume2,
    label: "Sounds",
    name: "Pixabay",
    href: "https://pixabay.com/service/license-summary/",
    rows: [
      { key: "Authors", value: "freesound_community, emilianodleon" },
      { key: "License", value: "Pixabay Content License" },
      { key: "Changes", value: "Mixed and edited" },
    ],
  },
  {
    icon: Shapes,
    label: "Icons",
    name: "SVG Repo",
    href: "https://www.svgrepo.com",
    rows: [
      { key: "License", value: "CC BY 4.0" },
      { key: "Website icons", value: "Lucide · ISC" },
    ],
    items: [
      {
        name: "Settings",
        author: "Solar Icons",
        href: "https://www.svgrepo.com/svg/523734/settings",
      },
      {
        name: "Sun",
        author: "Dazzle UI",
        href: "https://www.svgrepo.com/svg/532889/sun",
      },
      {
        name: "Night moon",
        author: "nickylimyeanfen",
        href: "https://www.svgrepo.com/svg/381213/dark-mode-night-moon",
      },
      {
        name: "Random",
        author: "FortAwesome",
        href: "https://www.svgrepo.com/svg/352388/random",
      },
      {
        name: "Chip AI",
        author: "wishforge.games",
        href: "https://www.svgrepo.com/svg/235253/chip-ai",
      },
    ],
  },
];

export function CreditsSection() {
  return (
    <section id="credits" className="HomePage-CreditsSection-section">
      <div className="HomePage-CreditsSection-inner">
        <header className="HomePage-CreditsSection-header">
          <h2 className="HomePage-CreditsSection-title">Credits</h2>
          <p className="HomePage-CreditsSection-intro">
            ChessMaster stands on the shoulders of free work by other people.
            Thank you to every author below.
          </p>
        </header>

        <div className="HomePage-CreditsSection-grid">
          {CREDITS.map(({ icon: Icon, ...credit }) => (
            <article key={credit.name} className="HomePage-CreditsSection-card">
              <span className="HomePage-CreditsSection-avatar">
                <Icon aria-hidden="true" />
              </span>
              <span className="HomePage-CreditsSection-label">
                {credit.label}
              </span>
              <a
                className="HomePage-CreditsSection-link"
                href={credit.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {credit.name}
              </a>
              <dl className="HomePage-CreditsSection-rows">
                {credit.rows.map((row) => (
                  <div key={row.key} className="HomePage-CreditsSection-row">
                    <dt>{row.key}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
              {credit.items && (
                <ul className="HomePage-CreditsSection-items">
                  {credit.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.name}
                      </a>
                      <span>{item.author}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
