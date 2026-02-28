import nextConfig from "eslint-config-next";

const config = [
  {
    ignores: ["convex/_generated/**"],
  },
  ...nextConfig,
];

export default config;
