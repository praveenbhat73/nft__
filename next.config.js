/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // env: {
  //   PINATA_JWT: process.env.local.PINATA_JWT,

  // },
  images: {
    domains: ['gateway.pinata.cloud',
    'images.clerk.dev'],
  },
};

module.exports = nextConfig;
