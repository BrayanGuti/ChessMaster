import './Header.css';
import { useState } from 'react';
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="HomePage-Header-header">
      <div className="HomePage-Header-container">
        <div className="HomePage-Header-content">
          <Link
            to="/"
            className="HomePage-Header-logo"
          >
            ChessPro
          </Link>
          <nav className="HomePage-Header-nav">
            <NavLink href="/">Home</NavLink>
            <NavLink href="#tournaments">Tournaments</NavLink>
            <NavLink href="#video">Watch Video</NavLink>
          </nav>
          <button
            className="HomePage-Header-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="HomePage-Header-menu-icon" /> : <Menu className="HomePage-Header-menu-icon" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="HomePage-Header-mobile-menu">
          <nav className="HomePage-Header-mobile-nav">
            <NavLink href="/">Home</NavLink>
            <NavLink href="#tournaments">Tournaments</NavLink>
            <NavLink href="#video">Watch Video</NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  children: string;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      to={href}
      className="HomePage-Header-link"
    >
      {children}
    </Link>
  );
}