import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Usa la carpeta `frontend` como raíz de la app para Turbopack
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
