const nextConfig: import("next").NextConfig = {
  // Externalize packages with native bindings / WASM that fail during static build
  serverExternalPackages: [
    "@coinbase/agentkit",
    "@coinbase/agentkit-langchain",
    "@noble/hashes",
    "viem",
    "wagmi",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.weserv.nl",
      },
    ],
  },
  turbopack: {},
  async redirects() {
    return [
      {
        source: "/dashboard/spartil",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/dashboard/spartial",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/dashboard/spatial",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/dashboard/spartil-matrix",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/dashboard/spartial-matrix",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/dashboard/spatial-matrix",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/spartil",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/spartial",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
      {
        source: "/spatial",
        destination: "/dashboard/portfolio",
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent bundling of packages that require native modules
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "@coinbase/agentkit",
      ];
    }
    return config;
  },
};

export default nextConfig;
