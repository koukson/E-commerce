import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import api from '../config/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.get<{ products: Product[] }>('/products?limit=4');
      setFeaturedProducts(response.products);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-r from-primary to-secondary text-primary-content">
        <div className="hero-content text-center py-20">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">
              Bienvenue sur notre boutique en ligne
            </h1>
            <p className="mb-5">
              Découvrez notre sélection de produits de qualité à des prix
              imbattables. Livraison rapide et service client exceptionnel.
            </p>
            <Link to="/products" className="btn btn-accent">
              Voir les produits
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi nous choisir ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="card-title">Livraison rapide</h3>
                <p>Livraison gratuite pour les commandes supérieures à 50€</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="card-title">Paiement sécurisé</h3>
                <p>Transactions sécurisées avec cryptage SSL</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="card-title">Satisfaction garantie</h3>
                <p>Retour gratuit sous 30 jours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Produits en vedette</h2>
            <Link to="/products" className="btn btn-outline">
              Voir tout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ce que disent nos clients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="italic">
                    "Excellent service et produits de qualité. Je recommande
                    vivement cette boutique !"
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold">Client satisfait</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
