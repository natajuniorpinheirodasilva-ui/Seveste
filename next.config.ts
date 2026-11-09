import type { NextConfig } from "next";

// Endereço da API em Go. O front-end acessa tudo por /api/* (mesma origem),
// assim o cookie de sessão httpOnly funciona sem precisar de CORS.
const API_URL = process.env.API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
