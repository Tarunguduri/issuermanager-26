
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1XVwdmm6fe/',
      icon: Facebook,
    },
    {
      name: 'Twitter',
      url: 'https://x.com/review_rvoffl?t=Oa80sXJUn9hlZVDUD1rs-w&s=08',
      icon: Twitter,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/re_view.official?igsh=MW04emczang1ZDQxNw==',
      icon: Instagram,
    },
    {
      name: 'LinkedIn',
      url: 'http://linkedin.com/company/re-viewrv25',
      icon: Linkedin,
    },
    {
      name: 'Email',
      url: 'mailto:reviewrv25@gmail.com',
      icon: Mail,
    },
  ];

  return (
    <footer className={cn("border-t border-border py-6", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={link.name}
              >
                <link.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} JAGRUTHI - Smart Citizen Issue Management System by RE-VIEW. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
