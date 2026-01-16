/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self';",
            "connect-src 'self' https://e621.net https://api.rule34.xxx https://xbooru.com https://static1.e621.net;",
            "img-src 'self' https://static1.e621.net https://e621.net https://img.rule34.xxx https://us.rule34.xxx https://api-cdn.rule34.xxx https://img.xbooru.com https://xbooru.com data:;",
            "media-src 'self' https://static1.e621.net https://e621.net https://xbooru.com https://img.xbooru.com data:;",
            "frame-src 'self';",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
            "style-src 'self' 'unsafe-inline';"
          ].join(' '),
        },
        ],
      },
    ];
  },
};

export default nextConfig;
