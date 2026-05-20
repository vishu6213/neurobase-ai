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
