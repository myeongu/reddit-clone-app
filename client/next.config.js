/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["www.gravatar.com", "localhost", "ec2-43-200-5-46.ap-northeast-2.compute.amazonaws.com"],
  }
}

module.exports = nextConfig
