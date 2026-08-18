import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Flyers de eventos subidos desde /admin/eventos: quedan en Supabase
    // Storage (bucket público "flyers"), no en /public como los dos flyers
    // originales.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pksutvuidmjkwhrvokvv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
