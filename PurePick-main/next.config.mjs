/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**' ,
            },
            {
                protocol: 'https',
                hostname: 'assets.aceternity.com',
            },
            {
                protocol: 'https',
                hostname: 'https://nikhil-belide.netlify.app/images',
            },
            {
                protocol: 'https',
                hostname: 'https://cdni.iconscout.com/illustration/premium/thumb/'
            },
            {
                protocol: "http",
                hostname: "**",
            },
            {
                protocol: 'https',
                hostname: 'drive.google.com',
            },
        ],
    },
};
export default nextConfig;
