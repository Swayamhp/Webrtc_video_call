import { Mail, Phone, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="text-center py-10 bg-gray-800 text-white">
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
              href=""
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
            >
              <Phone size={18} />
              {/* <span>Call +91 6371400124</span> */}
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
}
