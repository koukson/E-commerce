import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Mail, Edit, Check, X, Eye, FileText, MapPin, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { Product, Order, ContactMessage } from '../types';

const Admin = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stocks' | 'orders' | 'messages' | 'content'>('stocks');
  
  // Produits
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [editingStock, setEditingStock] = useState<{ id: string; stock: number } | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);

  // Commandes
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Messages
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [responseTexts, setResponseTexts] = useState<{ [key: string]: string }>({});
  const [filterResponded, setFilterResponded] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [isAuthenticated, user, loading, navigate]);

  const loadData = () => {
    if (activeTab === 'stocks') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'messages') {
      loadMessages();
    } else if (activeTab === 'content') {
      loadContent();
    }
  };

  // Contenu du site (About / Contact)
  interface AboutContent {
    title: string;
    subtitle: string;
    history: string;
    values: string;
    security: string;
    delivery: string;
    service: string;
    ctaTitle: string;
    ctaText: string;
  }
  interface ContactContent {
    pageTitle: string;
    pageSubtitle: string;
    email: string;
    emailLabel: string;
    phone: string;
    phoneLabel: string;
    address: string;
  }
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [contactContent, setContactContent] = useState<ContactContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  const loadContent = async () => {
    try {
      setLoadingContent(true);
      const [about, contact] = await Promise.all([
        api.get<AboutContent>('/admin/settings/about'),
        api.get<ContactContent>('/admin/settings/contact'),
      ]);
      setAboutContent(about);
      setContactContent(contact);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingContent(false);
    }
  };

  const saveAbout = async () => {
    if (!aboutContent) return;
    try {
      setSavingContent(true);
      await api.put('/admin/settings/about', aboutContent);
      alert('Contenu À propos enregistré.');
    } catch (e: any) {
      alert('Erreur lors de l\'enregistrement.');
    } finally {
      setSavingContent(false);
    }
  };

  const saveContact = async () => {
    if (!contactContent) return;
    try {
      setSavingContent(true);
      await api.put('/admin/settings/contact', contactContent);
      alert('Coordonnées Contact enregistrées.');
    } catch (e: any) {
      alert('Erreur lors de l\'enregistrement.');
    } finally {
      setSavingContent(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, filterResponded]);

  const loadProducts = async () => {
    try {
      setLoadingStocks(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get<{ products: Product[] }>('/admin/products'),
        api.get<{ categories: string[] }>('/products/categories/list'),
      ]);
      setProducts(productsRes.products);
      setCategories(categoriesRes.categories || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des produits:', error);
      alert('Erreur lors du chargement des produits');
    } finally {
      setLoadingStocks(false);
    }
  };

  const handleCreateProduct = () => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: categories[0] || 'Électronique',
      stock: 0,
    });
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({ ...product });
  };

  const handleSaveProduct = async () => {
    if (!productForm?.name || !productForm?.description || productForm?.price == null || !productForm?.image || !productForm?.category || productForm?.stock == null) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    try {
      setSavingProduct(true);
      if (productForm.id) {
        await api.put(`/admin/products/${productForm.id}`, productForm);
        alert('Produit mis à jour.');
      } else {
        await api.post('/admin/products', productForm);
        alert('Produit créé.');
      }
      setProductForm(null);
      loadProducts();
    } catch (e: any) {
      alert(e.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Supprimer le produit "${product.name}" ?`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      loadProducts();
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la suppression.');
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await api.put(`/admin/products/${productId}/stock`, { stock: newStock });
      setEditingStock(null);
      loadProducts();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      alert('Erreur lors de la mise à jour du stock');
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get<{ orders: Order[] }>('/admin/orders');
      setOrders(response.orders);
    } catch (error: any) {
      console.error('Erreur lors du chargement des commandes:', error);
      alert('Erreur lors du chargement des commandes');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status: newStatus });
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const params = filterResponded !== undefined ? `?responded=${filterResponded}` : '';
      const response = await api.get<{ messages: ContactMessage[] }>(`/admin/messages${params}`);
      setMessages(response.messages);
    } catch (error: any) {
      console.error('Erreur lors du chargement des messages:', error);
      alert('Erreur lors du chargement des messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleRespond = async (messageId: string) => {
    const responseText = responseTexts[messageId] || '';
    if (!responseText.trim()) {
      alert('Veuillez saisir une réponse');
      return;
    }

    try {
      await api.post(`/admin/messages/${messageId}/respond`, { response: responseText });
      setResponseTexts((prev) => {
        const newTexts = { ...prev };
        delete newTexts[messageId];
        return newTexts;
      });
      setSelectedMessage(null);
      loadMessages();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'shipped': return 'badge-primary';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Panneau d'administration</h1>

        {/* Onglets */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === 'stocks' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            <Package className="w-4 h-4 mr-2" />
            Produits
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Commandes
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Messages ({messages.filter(m => !m.responded).length})
          </button>
          <button
            className={`tab ${activeTab === 'content' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <FileText className="w-4 h-4 mr-2" />
            À propos & Contact
          </button>
        </div>

        {/* Gestion des produits */}
        {activeTab === 'stocks' && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="card-title mb-0">Gestion des produits</h2>
                <button className="btn btn-primary" onClick={handleCreateProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau produit
                </button>
              </div>
              {loadingStocks ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <div className="font-bold">{product.name}</div>
                                <div className="text-sm text-base-content/70">
                                  {product.description.substring(0, 50)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{product.category}</td>
                          <td>{product.price.toFixed(2)} €</td>
                          <td>
                            {editingStock?.id === product.id ? (
                              <input
                                type="number"
                                min="0"
                                className="input input-bordered w-24"
                                value={editingStock.stock}
                                onChange={(e) =>
                                  setEditingStock({
                                    id: product.id,
                                    stock: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            ) : (
                              <span className={`badge ${product.stock === 0 ? 'badge-error' : product.stock < 10 ? 'badge-warning' : 'badge-success'}`}>
                                {product.stock}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              {editingStock?.id === product.id ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() =>
                                      handleStockUpdate(product.id, editingStock.stock)
                                    }
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setEditingStock(null)}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn btn-sm btn-primary"
                                  title="Modifier le stock"
                                  onClick={() =>
                                    setEditingStock({ id: product.id, stock: product.stock })
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-outline"
                                title="Modifier le produit"
                                onClick={() => handleEditProduct(product)}
                              >
                                Modifier
                              </button>
                              <button
                                className="btn btn-sm btn-error btn-outline"
                                title="Supprimer"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Ajouter / Modifier produit */}
        {productForm && (
          <dialog open className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg">{productForm.id ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <div className="space-y-4 py-4">
                <div className="form-control">
                  <label className="label">Nom</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Nom du produit"
                  />
                </div>
                <div className="form-control">
                  <label className="label">Description</label>
                  <textarea
                    className="textarea textarea-bordered"
                    rows={3}
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">Prix (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input input-bordered"
                      value={productForm.price ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">Stock</label>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered"
                      value={productForm.stock ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">Catégorie</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    list="categories-list"
                    value={productForm.category || ''}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="Ex: Électronique, Audio, Accessoires"
                  />
                  <datalist id="categories-list">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div className="form-control">
                  <label className="label">URL de l'image</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={productForm.image || ''}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => setProductForm(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSaveProduct} disabled={savingProduct}>
                  {savingProduct ? 'Enregistrement...' : productForm.id ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={() => setProductForm(null)}>
              <button type="button">fermer</button>
            </form>
          </dialog>
        )}

        {/* Gestion des commandes */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <>
                {orders.map((order) => (
                  <div key={order.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">
                              Commande #{order.id.slice(0, 8)}
                            </h3>
                            <select
                              className={`select select-sm ${getStatusColor(order.status)}`}
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            >
                              <option value="pending">En attente</option>
                              <option value="processing">En traitement</option>
                              <option value="shipped">Expédiée</option>
                              <option value="delivered">Livrée</option>
                              <option value="cancelled">Annulée</option>
                            </select>
                          </div>
                          <p className="text-sm text-base-content/70">
                            Client: {order.user?.name} ({order.user?.email})
                          </p>
                          <p className="text-sm text-base-content/70">
                            Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-base-content/70">
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-2xl font-bold">{order.total.toFixed(2)} €</p>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() =>
                              setSelectedOrder(selectedOrder?.id === order.id ? null : order)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {selectedOrder?.id === order.id ? 'Masquer' : 'Détails'}
                          </button>
                        </div>
                      </div>

                      {selectedOrder?.id === order.id && (
                        <div className="mt-4 pt-4 border-t border-base-300">
                          <h4 className="font-bold mb-2">Articles:</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-2 bg-base-200 rounded"
                              >
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold">{item.product.name}</p>
                                  <p className="text-sm text-base-content/70">
                                    Quantité: {item.quantity} × {item.price.toFixed(2)} €
                                  </p>
                                </div>
                                <p className="font-bold">
                                  {(item.price * item.quantity).toFixed(2)} €
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Gestion des messages */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex gap-2 mb-4">
                  <button
                    className={`btn btn-sm ${filterResponded === undefined ? 'btn-active' : 'btn-outline'}`}
                    onClick={() => setFilterResponded(undefined)}
                  >
                    Tous
                  </button>
                  <button
                    className={`btn btn-sm ${filterResponded === false ? 'btn-active' : 'btn-outline'}`}
                    onClick={() => setFilterResponded(false)}
                  >
                    Non répondu
                  </button>
                  <button
                    className={`btn btn-sm ${filterResponded === true ? 'btn-active' : 'btn-outline'}`}
                    onClick={() => setFilterResponded(true)}
                  >
                    Répondu
                  </button>
                </div>
              </div>
            </div>

            {loadingMessages ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">{message.subject}</h3>
                            {message.responded && (
                              <span className="badge badge-success">Répondu</span>
                            )}
                          </div>
                          <p className="text-sm text-base-content/70 mb-1">
                            De: {message.name} ({message.email})
                          </p>
                          <p className="text-sm text-base-content/70 mb-3">
                            {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <div className="bg-base-200 p-3 rounded mb-2">
                            <p className="text-sm">{message.message}</p>
                          </div>
                          {message.response && (
                            <div className="bg-primary/10 p-3 rounded mt-2">
                              <p className="text-sm font-semibold mb-1">Réponse:</p>
                              <p className="text-sm">{message.response}</p>
                            </div>
                          )}
                        </div>
                        {!message.responded && (
                          <div className="lg:w-96">
                            <textarea
                              className="textarea textarea-bordered w-full mb-2"
                              placeholder="Votre réponse..."
                              value={responseTexts[message.id] || ''}
                              onChange={(e) =>
                                setResponseTexts((prev) => ({
                                  ...prev,
                                  [message.id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              className="btn btn-primary btn-block"
                              onClick={() => handleRespond(message.id)}
                            >
                              Envoyer la réponse
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Contenu du site - À propos & Contact */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            {loadingContent ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <>
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Page À propos
                    </h2>
                    {aboutContent && (
                      <div className="space-y-4">
                        <div className="form-control">
                          <label className="label">Titre</label>
                          <input type="text" className="input input-bordered" value={aboutContent.title} onChange={e => setAboutContent({ ...aboutContent, title: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Sous-titre</label>
                          <input type="text" className="input input-bordered" value={aboutContent.subtitle} onChange={e => setAboutContent({ ...aboutContent, subtitle: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Notre histoire</label>
                          <textarea className="textarea textarea-bordered" rows={4} value={aboutContent.history} onChange={e => setAboutContent({ ...aboutContent, history: e.target.value })} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="form-control">
                            <label className="label">Nos valeurs</label>
                            <textarea className="textarea textarea-bordered" rows={2} value={aboutContent.values} onChange={e => setAboutContent({ ...aboutContent, values: e.target.value })} />
                          </div>
                          <div className="form-control">
                            <label className="label">Sécurité & confiance</label>
                            <textarea className="textarea textarea-bordered" rows={2} value={aboutContent.security} onChange={e => setAboutContent({ ...aboutContent, security: e.target.value })} />
                          </div>
                          <div className="form-control">
                            <label className="label">Livraison</label>
                            <textarea className="textarea textarea-bordered" rows={2} value={aboutContent.delivery} onChange={e => setAboutContent({ ...aboutContent, delivery: e.target.value })} />
                          </div>
                          <div className="form-control">
                            <label className="label">Service client</label>
                            <textarea className="textarea textarea-bordered" rows={2} value={aboutContent.service} onChange={e => setAboutContent({ ...aboutContent, service: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-control">
                          <label className="label">Titre CTA</label>
                          <input type="text" className="input input-bordered" value={aboutContent.ctaTitle} onChange={e => setAboutContent({ ...aboutContent, ctaTitle: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Texte CTA</label>
                          <input type="text" className="input input-bordered" value={aboutContent.ctaText} onChange={e => setAboutContent({ ...aboutContent, ctaText: e.target.value })} />
                        </div>
                        <button className="btn btn-primary" onClick={saveAbout} disabled={savingContent}>
                          {savingContent ? 'Enregistrement...' : 'Enregistrer À propos'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Coordonnées Contact
                    </h2>
                    {contactContent && (
                      <div className="space-y-4">
                        <div className="form-control">
                          <label className="label">Titre de la page</label>
                          <input type="text" className="input input-bordered" value={contactContent.pageTitle} onChange={e => setContactContent({ ...contactContent, pageTitle: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Sous-titre</label>
                          <input type="text" className="input input-bordered" value={contactContent.pageSubtitle} onChange={e => setContactContent({ ...contactContent, pageSubtitle: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Email</label>
                          <input type="email" className="input input-bordered" value={contactContent.email} onChange={e => setContactContent({ ...contactContent, email: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Label email (ex: Réponse sous 24–48 h)</label>
                          <input type="text" className="input input-bordered" value={contactContent.emailLabel} onChange={e => setContactContent({ ...contactContent, emailLabel: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Téléphone</label>
                          <input type="text" className="input input-bordered" value={contactContent.phone} onChange={e => setContactContent({ ...contactContent, phone: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Label téléphone (ex: Lun–Ven 9h–18h)</label>
                          <input type="text" className="input input-bordered" value={contactContent.phoneLabel} onChange={e => setContactContent({ ...contactContent, phoneLabel: e.target.value })} />
                        </div>
                        <div className="form-control">
                          <label className="label">Adresse (une ligne par ligne)</label>
                          <textarea className="textarea textarea-bordered" rows={3} value={contactContent.address} onChange={e => setContactContent({ ...contactContent, address: e.target.value })} />
                        </div>
                        <button className="btn btn-primary" onClick={saveContact} disabled={savingContent}>
                          {savingContent ? 'Enregistrement...' : 'Enregistrer Contact'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
