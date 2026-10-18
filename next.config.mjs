import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Alias eksplisit agar "@/..." tetap terbaca walau tsconfig tidak diparse oleh Next.
  webpack(config) {
    config.resolve.alias['@'] = path.join(dir, 'src');
    return config;
  },
};

export default nextConfig;
