import "./Header.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { scrollToSection } from "../scrollToSection";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="HomePage-Header-header">
      <div className="HomePage-Header-container">
        <div className="HomePage-Header-content">
          <nav className="HomePage-Header-nav-desktop">
            <div className="HomePage-Header-nav-item HomePage-Header-nav-item-first">
              ChessPro
            </div>
            <div className="HomePage-Header-nav-divider-container HomePage-Header-nav-divider-internal">
              <span className="HomePage-Header-plus">+</span>
            </div>
            <div className="HomePage-Header-nav-item">
              <ScrollLink targetId="creator">Creator</ScrollLink>
            </div>
            <div className="HomePage-Header-nav-divider-container HomePage-Header-nav-divider-internal">
              <span className="HomePage-Header-plus">+</span>
            </div>
            <div className="HomePage-Header-nav-item">
              <NavLink
                href="https://github.com/BrayanGuti/ChessMaster"
                target="_blank"
                rel="noopener noreferrer"
              >
                Code Base
              </NavLink>
            </div>
            <div className="HomePage-Header-nav-divider-container HomePage-Header-nav-divider-internal">
              <span className="HomePage-Header-plus">+</span>
            </div>
            <div className="HomePage-Header-nav-item HomePage-Header-nav-item-video">
              <ScrollLink targetId="get-started">Get started</ScrollLink>
            </div>
            <div className="HomePage-Header-nav-divider-container HomePage-Header-nav-divider-border"></div>
          </nav>
          <img
            src="/webicon.png"
            alt="ChessPro"
            className="HomePage-Header-mobile-logo"
          />
          <button
            className="HomePage-Header-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="HomePage-Header-menu-icon" />
            ) : (
              <Menu className="HomePage-Header-menu-icon" />
            )}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="HomePage-Header-mobile-menu">
          <nav className="HomePage-Header-mobile-nav">
            <ScrollLink
              targetId="creator"
              onNavigate={() => setIsMenuOpen(false)}
            >
              Creator
            </ScrollLink>
            <NavLink
              href="https://github.com/BrayanGuti/ChessMaster"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code Base
            </NavLink>
            <ScrollLink
              targetId="get-started"
              onNavigate={() => setIsMenuOpen(false)}
            >
              Get started
            </ScrollLink>
          </nav>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  children: string;
  target?: string;
  rel?: string;
}

function NavLink({ href, children, target, rel }: NavLinkProps) {
  return (
    <Link to={href} className="HomePage-Header-link" target={target} rel={rel}>
      {children}
    </Link>
  );
}

interface ScrollLinkProps {
  targetId: string;
  children: string;
  onNavigate?: () => void;
}

function ScrollLink({ targetId, children, onNavigate }: ScrollLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Primero cerramos el menú móvil para que el destino se calcule con el layout final
    onNavigate?.();
    scrollToSection(targetId);
  };

  return (
    <a
      href={`#${targetId}`}
      className="HomePage-Header-link"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
