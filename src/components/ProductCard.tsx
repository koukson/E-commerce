import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const canAddToCart = isAuthenticated && user?.role !== 'admin';

  const handleAddToCart = () => {
    if (canAddToCart) {
      addToCart(product);
    } else if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter des produits au panier');
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <figure>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-sm text-base-content/70 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-2xl font-bold text-primary">
            {product.price.toFixed(2)} €
          </span>
          <span className="badge badge-outline">
            {product.stock} en stock
          </span>
        </div>
        <div className="card-actions justify-end mt-4">
          <Link to={`/products/${product.id}`} className="btn btn-outline btn-sm">
            Voir détails
          </Link>
          {canAddToCart && (
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-sm"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
