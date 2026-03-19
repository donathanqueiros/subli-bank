/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    relay: {
      src: "./",
      language: "typescript",
      eagerEsModules: false,
    },
  },
};

export default nextConfig;
