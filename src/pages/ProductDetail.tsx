import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../config/api';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isAdminRole = (role?: string) =>
    role === 'admin' || role === 'moderator' || role === 'superadmin';
  const canAddToCart = isAuthenticated && !isAdminRole(user?.role);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const productData = await api.get<Product>(`/products/${productId}`);
      setProduct(productData);
    } catch (err: any) {
      console.error('Erreur lors du chargement du produit:', err);
      setError('Produit non trouvé');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Produit non trouvé</h1>
          <Link to="/products" className="btn btn-primary">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (canAddToCart) {
      addToCart(product, quantity);
      alert('Produit ajouté au panier !');
    } else if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter des produits au panier');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg shadow-xl"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <div className="badge badge-primary mb-4">{product.category}</div>
            <p className="text-2xl font-bold text-primary mb-4">
              {product.price.toFixed(2)} €
            </p>
            <p className="text-base-content/70 mb-6">{product.description}</p>

            <div className="mb-6">
              <p className="mb-2">
                <span className="font-semibold">Stock disponible :</span>{' '}
                {product.stock} unités
              </p>
            </div>

            {product.stock > 0 && canAddToCart ? (
              <div className="flex gap-4 items-center mb-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Quantité</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))
                    }
                    className="input input-bordered w-24"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary btn-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ajouter au panier
                </button>
              </div>
            ) : product.stock === 0 ? (
              <div className="alert alert-warning">
                <span>Ce produit est actuellement en rupture de stock</span>
              </div>
            ) : null}

            <div className="divider"></div>

            <div>
              <h3 className="font-bold mb-2">Caractéristiques :</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Produit de qualité supérieure</li>
                <li>Garantie satisfait ou remboursé</li>
                <li>Livraison rapide et sécurisée</li>
                <li>Support client disponible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
