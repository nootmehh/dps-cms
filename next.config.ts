import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "dps-cms.netlify.app",
          },
        ],
        destination: "https://cms.dpsmarkajalan.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
