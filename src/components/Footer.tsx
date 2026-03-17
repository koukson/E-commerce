import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer bg-base-200 text-base-content p-10">
      <nav>
        <h6 className="footer-title">Services</h6>
        <Link to="/products" className="link link-hover">
          Produits
        </Link>
        <Link to="/about" className="link link-hover">
          À propos
        </Link>
        <Link to="/contact" className="link link-hover">
          Contact
        </Link>
      </nav>
      <nav>
        <h6 className="footer-title">Entreprise</h6>
        <Link to="/about" className="link link-hover">
          À propos de nous
        </Link>
        <Link to="/contact" className="link link-hover">
          Contact
        </Link>
        <Link to="/jobs" className="link link-hover">
          Carrières
        </Link>
      </nav>
      <nav>
        <h6 className="footer-title">Légal</h6>
        <Link to="/terms" className="link link-hover">
          Conditions d'utilisation
        </Link>
        <Link to="/privacy" className="link link-hover">
          Politique de confidentialité
        </Link>
      </nav>
      <nav>
        <h6 className="footer-title">Réseaux sociaux</h6>
        <div className="grid grid-flow-col gap-4">
          <a href="#" className="text-xl hover:text-primary">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-xl hover:text-primary">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-xl hover:text-primary">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-xl hover:text-primary">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
