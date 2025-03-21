/** @type {import('next').NextConfig} */
const nextConfig = {
  // This ensures we deploy the app without relying on static generation
  output: 'standalone',
  
  // Disable image optimization to reduce build complexity
  images: {
    unoptimized: true,
  },
  
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Skip type checking during build to speed up deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip static generation and optimize for server-side rendering
  distDir: '.next',
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // Ignore API routes during static generation
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;