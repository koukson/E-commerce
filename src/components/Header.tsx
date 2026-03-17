import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, Package, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <Menu className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
                Produits
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                À propos
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </li>
            {isAuthenticated && user?.role !== 'admin' && (
              <li>
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                  Panier ({itemCount})
                </Link>
              </li>
            )}
          </ul>
        </div>
        <span className="text-xl font-semibold">
          🛒 E-Commerce
        </span>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/" className="btn btn-ghost">
              Accueil
            </Link>
          </li>
          <li>
            <Link to="/products" className="btn btn-ghost">
              Produits
            </Link>
          </li>
          <li>
            <Link to="/about" className="btn btn-ghost">
              À propos
            </Link>
          </li>
          <li>
            <Link to="/contact" className="btn btn-ghost">
              Contact
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {isAuthenticated ? (
          <>
            {user?.role !== 'admin' && (
              <Link to="/cart" className="btn btn-ghost btn-circle relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="badge badge-sm badge-primary absolute -top-1 -right-1">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link to="/profile" className="justify-between">
                    Profil
                    <span className="badge">{user?.name}</span>
                  </Link>
                </li>
                {user?.role !== 'admin' && (
                  <li>
                    <Link to="/orders">
                      <Package className="w-4 h-4" />
                      Mes Commandes
                    </Link>
                  </li>
                )}
                {user?.role === 'admin' && (
                  <li>
                    <Link to="/admin">
                      <Settings className="w-4 h-4" />
                      Administration
                    </Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost">
              Connexion
            </Link>
            <Link to="/register" className="btn btn-primary">
              Inscription
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
