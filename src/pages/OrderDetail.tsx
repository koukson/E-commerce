import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { Order } from '../types';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.get<{ order: Order }>(`/orders/${id}`);
        setOrder(response.order);
      } catch (error: any) {
        console.error('Erreur lors de la récupération de la commande:', error);
        if (error.message.includes('404')) {
          navigate('/orders');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isAuthenticated, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'processing':
        return 'badge-info';
      case 'shipped':
        return 'badge-primary';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'processing':
        return 'En traitement';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Commande non trouvée</h1>
          <Link to="/orders" className="btn btn-primary">
            Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/orders" className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-4xl font-bold">Détails de la commande</h1>
        </div>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Commande #{order.id.slice(0, 8)}
                </h2>
                <p className="text-sm text-base-content/70">
                  Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className={`badge badge-lg ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Articles commandés
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-base-300 last:border-0 last:pb-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full sm:w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-1">{item.product.name}</h4>
                    <p className="text-sm text-base-content/70 mb-2">
                      {item.product.category}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Quantité: {item.quantity}</span>
                      <span className="text-sm">
                        Prix unitaire: {item.price.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Résumé
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{order.total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{order.total >= 50 ? 'Gratuite' : '5.00 €'}</span>
              </div>
              <div className="divider"></div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>
                  {(order.total + (order.total >= 50 ? 0 : 5)).toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/orders" className="btn btn-outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux commandes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
