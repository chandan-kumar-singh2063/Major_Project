import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaArrowUp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { Store, Send } from 'lucide-react';
import FeedbackModal from './FeedBackModal';

const Footer = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [email, setEmail] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialMedia = [
    { icon: FaFacebookF, href: 'https://www.facebook.com/nigam.yadav.9693', color: '#1877F2' },
    { icon: FaTwitter, href: 'https://x.com/NIGAM22370630', color: '#1DA1F2' },
    { icon: FaGithub, href: 'https://github.com/nigamyadav72', color: '#333' },
    { icon: FaLinkedinIn, href: 'https://www.linkedin.com/in/nigamyadav72/', color: '#0077B5' },
    { icon: FaInstagram, href: 'https://www.instagram.com/nigamyadav72/', color: '#E1306C' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for newsletter subscription
    alert(`Subscribed with: ${email}`);
    setEmail('');
  };

  return (
    <footer className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl text-gray-800 dark:text-gray-200 pt-20 pb-10 mt-20 border-t border-gray-200 dark:border-gray-800 transition-all overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 text-3xl font-black tracking-tight group">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Store size={28} className="text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                e-pasal
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Revolutionizing the digital marketplace in Nepal. We connect creators, sellers, and shoppers through a seamless, AI-powered experience.
            </p>
            <div className="flex items-center gap-3">
              {socialMedia.map(({ icon: Icon, href, color }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
                  style={{ '--hover-color': color } as any}
                >
                  <Icon size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-[var(--hover-color)] transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Explore</h3>
            <ul className="space-y-4">
              {[
                { name: "Home", to: "/" },
                { name: "Shop Collections", to: "/category/fashion" },
                { name: "About Our Story", to: "/aboutus" },
                { name: "Get in Touch", to: "/contactus" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-accent transition-colors flex items-center group"
                >
                  <span className="w-0 group-hover:w-4 h-0.5 bg-primary mr-0 group-hover:mr-2 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                  Share Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="mt-1 p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                  <FaMapMarkerAlt size={14} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Kathmandu, Nepal<br />New Baneshwor, 44600
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                  <FaPhoneAlt size={14} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">+977 9811122233</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                  <FaEnvelope size={14} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">support@e-pasal.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Newsletter</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stay ahead! Subscribe for exclusive offers, updates, and more.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 bottom-1.5 px-3 rounded-lg bg-primary text-white hover:bg-accent transition-colors flex items-center justify-center shadow-lg shadow-primary/20"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-500 italic">
                * We respect your privacy. No spam, ever.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-500 font-medium tracking-wide">
            © {new Date().getFullYear()} E-PASAL. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-primary transition-colors uppercase font-bold tracking-tighter">Privacy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-primary transition-colors uppercase font-bold tracking-tighter">Terms</Link>
            <Link to="/donate" className="text-xs text-gray-500 hover:text-primary transition-colors uppercase font-bold tracking-tighter" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Donate</Link>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-4 rounded-2xl bg-primary/90 text-white hover:bg-primary shadow-2xl hover:shadow-primary/40 backdrop-blur-md transition-all active:scale-95 z-40 group border border-white/20"
        aria-label="Back to top"
      >
        <FaArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
      </button>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </footer>
  );
};

export default Footer;