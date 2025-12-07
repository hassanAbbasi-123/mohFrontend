/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "your-cdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "greendale.com",
        pathname: "/cdn/shop/files/**",
      },
      // 🔹 Render backend HTTP
      {
        protocol: "http",
        hostname: "mohcapital-backend.onrender.com",
        pathname: "/uploads/**",
      },
      // 🔹 Render backend HTTPS (optional, if your backend supports https)
      {
        protocol: "https",
        hostname: "mohcapital-backend.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;