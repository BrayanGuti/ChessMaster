import './Footer.css';
import { Link } from 'react-router-dom'
import { Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="HomePage-Footer-footer">
      <div className="HomePage-Footer-container">
        <div className="HomePage-Footer-content">
          <div className="HomePage-Footer-text">
            &copy; {new Date().getFullYear()} ChessMaster by BrayanGuti.
          </div>
          <div className="HomePage-Footer-icons">
            <SocialLink href="https://github.com/BrayanGuti" icon={Github} label="GitHub" />
            <SocialLink href="https://www.linkedin.com/in/brayan-gutierrez-b16048260/" icon={Linkedin} label="LinkedIn" />
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
    <a
      href={href}
      className="HomePage-Footer-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      <Icon className="HomePage-Footer-icon" />
    </a>
  );
}