import './Footer.css';
import { Link } from 'react-router-dom'
import { Github, Twitter, LucideLinkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="HomePage-Footer-footer">
      <div className="HomePage-Footer-container">
        <div className="HomePage-Footer-content">
            <div className="HomePage-Footer-text">
            &copy; {new Date().getFullYear()} ChessMaster by BrayanGuti.
            </div>
          <div className="HomePage-Footer-icons">
            <SocialLink href="https://twitter.com" icon={Twitter} label="Twitter" />
            <SocialLink href="https://github.com" icon={Github} label="GitHub" />
            <SocialLink href="https://Linkedin.com" icon={LucideLinkedin} label="Linkedin" />
          </div>
        </div>
      </div>
    </footer>
  );
}

interface SocialLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SocialLink({ href, icon: Icon, label }: SocialLinkProps) {
  return (
    <Link 
      to={href} 
      className="HomePage-Footer-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="HomePage-Footer-sr-only">{label}</span>
      <Icon className="HomePage-Footer-icon" />
    </Link>
  );
}