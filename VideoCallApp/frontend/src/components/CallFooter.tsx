import React from 'react';
import { Mail, Phone, Linkedin } from 'lucide-react';

export const CallFooter: React.FC = () => {
  return (
    <footer className="text-center p-4 bg-gray-700 text-white">
      <p>© 2025 VideoConnect. All rights reserved.</p>

      <div className="flex justify-center gap-6 mt-2">
        <a
          href="mailto:hgouda244@gmail.com"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
        >
          <Mail size={18} />
          <span>Email</span>
        </a>

        <a
          href="tel:6371400124"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
        >
          <Phone size={18} />
          <span>Call</span>
        </a>

        <a
          href="https://www.linkedin.com/in/hara-prasad-gouda-9b458a2a9/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
        >
          <Linkedin size={18} />
          <span>LinkedIn</span>
        </a>
      </div>
    </footer>
  );
};
