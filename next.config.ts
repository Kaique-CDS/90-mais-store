import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desativa o Turbopack — usa Webpack que é mais estável e leve
  turbopack: undefined,
  images: {
    remotePatterns: [
      // Supabase Storage (legado)
      {
        protocol: "https",
        hostname: "bzdjxnenljqwtvbdonxl.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Cloudinary (novo)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
