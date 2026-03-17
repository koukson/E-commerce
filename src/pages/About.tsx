import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Truck, Headphones } from 'lucide-react';
import api from '../config/api';

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

const defaultContent: AboutContent = {
  title: 'À propos de nous',
  subtitle: 'Votre boutique en ligne de confiance depuis le premier clic.',
  history: "Nous avons créé cette boutique avec une idée simple : proposer des produits de qualité à des prix justes, avec un service client à l'écoute. Que vous soyez à la recherche d'un cadeau ou d'un achat pour vous-même, notre équipe met tout en œuvre pour que votre expérience soit fluide et agréable.",
  values: 'Qualité, transparence et respect de nos clients. Chaque produit est sélectionné avec soin pour répondre à vos attentes.',
  security: "Paiement sécurisé et données protégées. Votre confiance est notre priorité absolue.",
  delivery: 'Livraison rapide et soignée. Livraison gratuite à partir de 50 € d\'achat pour vous faire profiter au mieux de nos produits.',
  service: "Une équipe disponible pour répondre à vos questions. N'hésitez pas à nous contacter via la page Contact.",
  ctaTitle: 'Une question ?',
  ctaText: 'Notre équipe est à votre disposition pour toute demande.',
};

const About = () => {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AboutContent>('/settings/about')
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-4xl font-bold mb-4 text-center">{content.title}</h1>
        <p className="text-center text-base-content/70 mb-12 text-lg">{content.subtitle}</p>

        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Notre histoire</h2>
            <p className="text-base-content/80 leading-relaxed">{content.history}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Nos valeurs</h3>
              </div>
              <p className="text-base-content/80">{content.values}</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Sécurité & confiance</h3>
              </div>
              <p className="text-base-content/80">{content.security}</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Livraison</h3>
              </div>
              <p className="text-base-content/80">{content.delivery}</p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Service client</h3>
              </div>
              <p className="text-base-content/80">{content.service}</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold mb-2">{content.ctaTitle}</h2>
            <p className="text-base-content/80 mb-4">{content.ctaText}</p>
            <Link to="/contact" className="btn btn-primary">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
