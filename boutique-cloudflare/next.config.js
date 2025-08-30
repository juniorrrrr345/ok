/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'images.boutique.com',
      'imagedelivery.net', // Cloudflare Images
      'pub-', // R2 public buckets
    ],
  },
  // Configuration pour Cloudflare Pages
  output: 'export',
  distDir: '.vercel/output/static',
  
  // Variables d'environnement
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.boutique.com',
    NEXT_PUBLIC_SHOP_NAME: process.env.NEXT_PUBLIC_SHOP_NAME || 'Boutique Cloudflare',
  },
}

module.exports = nextConfig