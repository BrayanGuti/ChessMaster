import './Header.css';
import { useState } from 'react';
import { Link } from 'react-router-dom'
import { Settings, Menu, X } from 'lucide-react';

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
            ChessMaster
          </Link>
          <nav className="HomePage-Header-nav">
            <NavLink href="/settings" icon={Settings} label="Settings" />
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
            <NavLink href="/settings" icon={Settings} label="Settings" />
          </nav>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function NavLink({ href, icon: Icon, label }: NavLinkProps) {
  return (
    <Link 
      to={href} 
      className="HomePage-Header-link"
    >
      <Icon className="HomePage-Header-link-icon" />
      <span className="HomePage-Header-link-label">{label}</span>
    </Link>
  );
}