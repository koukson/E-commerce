import { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';
import api from '../config/api';

interface ContactContent {
  pageTitle: string;
  pageSubtitle: string;
  email: string;
  emailLabel: string;
  phone: string;
  phoneLabel: string;
  address: string;
}

const defaultContent: ContactContent = {
  pageTitle: 'Nous contacter',
  pageSubtitle: 'Une question, une suggestion ? Envoyez-nous un message, nous vous répondrons au plus vite.',
  email: 'contact@ecommerce.fr',
  emailLabel: 'Réponse sous 24–48 h',
  phone: '+33 1 23 45 67 89',
  phoneLabel: 'Lun–Ven 9h–18h',
  address: '123 rue du Commerce\n75001 Paris, France',
};

const Contact = () => {
  const [content, setContent] = useState<ContactContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get<ContactContent>('/settings/contact')
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert(error.message || 'Erreur lors de l\'envoi du message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-center">{content.pageTitle}</h1>
        <p className="text-center text-base-content/70 mb-12 text-lg">{content.pageSubtitle}</p>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email</h3>
                    <a href={`mailto:${content.email}`} className="link link-primary">
                      {content.email}
                    </a>
                    <p className="text-sm text-base-content/70 mt-1">{content.emailLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Téléphone</h3>
                    <a href={`tel:${content.phone.replace(/\s/g, '')}`} className="link link-primary">
                      {content.phone}
                    </a>
                    <p className="text-sm text-base-content/70 mt-1">{content.phoneLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Adresse</h3>
                    <p className="text-base-content/80 whitespace-pre-line">{content.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Message envoyé</h2>
                    <p className="text-base-content/80 mb-6">
                      Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="btn btn-outline"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="card-title text-xl mb-4">Formulaire de contact</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="form-control">
                        <label className="label" htmlFor="name">
                          <span className="label-text">Nom</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Votre nom"
                          className="input input-bordered"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label" htmlFor="email">
                          <span className="label-text">Email</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="votre@email.fr"
                          className="input input-bordered"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="label" htmlFor="subject">
                          <span className="label-text">Sujet</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          className="select select-bordered"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Choisir un sujet</option>
                          <option value="question">Question sur un produit</option>
                          <option value="order">Suivi de commande</option>
                          <option value="return">Retour / Échange</option>
                          <option value="partnership">Partenariat</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label" htmlFor="message">
                          <span className="label-text">Message</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          placeholder="Votre message..."
                          className="textarea textarea-bordered h-32"
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="card-actions justify-end pt-2">
                        <button type="submit" className="btn btn-primary">
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
