// components/Footer.tsx
'use client';
import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Github, Slack, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";

const XIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Footer: React.FC = () => {
    const pathname = usePathname();
    if (pathname.startsWith('/product-insights/')) {
        return null;
    }
    return (
        <footer className="py-8 border-t-1 bg-gray-200 dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="flex flex-col gap-4 justify-between items-center">
                    <div className="flex gap-2 justify-center items-center mb-4 md:mb-0 cursor-pointer">
                        <Slack className="w-6 h-6" />
                        <span className="font-bold text-xl">PurePick</span>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-4 text-gray-400">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <Link href="/about" className="hover:text-blue-600">About</Link>
                        <Link href="/services" className="hover:text-blue-600">Services</Link>
                        <Link href="/feedback" className="hover:text-blue-600">Feedback</Link>
                        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
                        <Link href="/careers" className="hover:text-blue-600">Careers</Link>
                    </nav>
                    <div className="flex gap-4 text-gray-400">
                        <Link href="https://www.linkedin.com/in/anmol-asati-bb3a62291/">
                            <Linkedin className="w-6 h-6 hover:text-gray-300" />
                        </Link>
                        <Link href="https://www.instagram.com/">
                            <Instagram className="w-6 h-6 hover:text-gray-300" />
                        </Link>
                        <Link href="https://x.com/GuptaJva17229" className="hover:text-gray-300">
                            <XIcon />
                        </Link>
                        <Link href="https://github.com/anmolasati24">
                            <Github className="w-6 h-6 hover:text-gray-300" />
                        </Link>
                    </div>
                </div>
                <div className="mt-8 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} PurePick. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;