import { useAuth } from '../context/AuthContext';
import { User, Mail, LogOut, Package, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdminRole = (role?: string) =>
    role === 'admin' || role === 'moderator' || role === 'superadmin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Non autorisé</h1>
          <p className="mb-6">Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Mon Profil</h1>
          <span className="badge badge-outline">
            Rôle : {isAdminRole(user.role) ? 'Administrateur' : 'Client'}
          </span>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-20">
                  <span className="text-3xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-base-content/70">{user.email}</p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Nom</p>
                  <p className="text-base-content/70">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-base-content/70">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="space-y-4">
              {isAdminRole(user.role) ? (
                <>
                  <div className="alert alert-info">
                    <Shield className="w-5 h-5 mr-2" />
                    <span>
                      Vous êtes connecté en tant qu'administrateur. Vous ne pouvez pas
                      passer de commandes ni utiliser le panier. Votre rôle est de
                      gérer les produits, valider les commandes et répondre aux messages.
                    </span>
                  </div>
                  <Link to="/admin" className="btn btn-primary btn-block">
                    <Shield className="w-4 h-4 mr-2" />
                    Accéder au panneau d'administration
                  </Link>
                </>
              ) : (
                <Link to="/orders" className="btn btn-outline btn-block">
                  <Package className="w-4 h-4 mr-2" />
                  Mes Commandes
                </Link>
              )}
            </div>

            <div className="divider"></div>

            <div className="card-actions justify-end">
              <button onClick={handleLogout} className="btn btn-error">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
