import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleCreateOrder = async () => {
    if (items.length === 0) return;

    try {
      setIsCreatingOrder(true);
      const response = await api.post('/orders/create');
      // Type guard to ensure correct response shape
      const orderId =
        response &&
        typeof response === 'object' &&
        'order' in response &&
        response.order &&
        typeof response.order === 'object' &&
        'id' in response.order
          ? (response.order as { id: string | number }).id
          : undefined;

      if (typeof orderId === 'undefined') {
        throw new Error('Réponse invalide lors de la création de la commande');
      }

      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (error: any) {
      console.error('Erreur lors de la création de la commande:', error);
      alert(error.message || 'Erreur lors de la création de la commande');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Connexion requise</h1>
          <p className="mb-6">Veuillez vous connecter pour accéder à votre panier.</p>
          <Link to="/login" className="btn btn-primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Accès non autorisé</h1>
          <p className="mb-6">Les administrateurs ne peuvent pas accéder au panier ni passer de commande.</p>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-base-content/30" />
            <h1 className="text-4xl font-bold mb-4">Votre panier est vide</h1>
            <p className="mb-6 text-base-content/70">
              Ajoutez des produits à votre panier pour commencer vos achats.
            </p>
            <Link to="/products" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Mon Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-base-300 last:border-0 last:pb-0"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {item.product.name}
                      </h3>
                      <p className="text-base-content/70 mb-2">
                        {item.product.price.toFixed(2)} €
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Quantité</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.product.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="input input-bordered w-24"
                          />
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="btn btn-error btn-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {(item.product.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <button
                    onClick={clearCart}
                    className="btn btn-outline btn-error"
                  >
                    Vider le panier
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-4">
              <div className="card-body">
                <h2 className="card-title mb-4">Résumé de la commande</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span>{total >= 50 ? 'Gratuite' : '5.00 €'}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{(total + (total >= 50 ? 0 : 5)).toFixed(2)} €</span>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-block"
                  onClick={handleCreateOrder}
                  disabled={isCreatingOrder || items.length === 0}
                >
                  {isCreatingOrder ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Création...
                    </>
                  ) : (
                    'Passer la commande'
                  )}
                </button>
                <Link
                  to="/products"
                  className="btn btn-outline btn-block"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
