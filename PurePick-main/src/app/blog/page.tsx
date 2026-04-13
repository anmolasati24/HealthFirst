'use client'

import { motion } from 'framer-motion'
import { Clock, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

const blogPosts = [
    {
        id: 1,
        url: "https://www.fssai.gov.in/upload/uploadfiles/files/Guidance_Document_Labelling.pdf",
        title: "Why You Should Always Check Ingredient Labels Before Buying",
        excerpt: "Most people skip reading ingredient labels, but what's hidden in your food could be harming your health. Here's what to look for and why it matters.",
        category: "Health",
        readTime: "5 min read",
        date: "Feb 20, 2026",
        bg: "bg-red-500/10",
        tag: "bg-red-500/20 text-red-400"
    },
    {
        id: 2,
        url: "https://www.efsa.europa.eu/en/topics/topic/food-additives",
        title: "The Truth About E-Numbers in Your Food",
        excerpt: "E-numbers appear on almost every processed food label. But are they dangerous? We break down the most common ones and what they actually do to your body.",
        category: "Ingredients",
        readTime: "7 min read",
        date: "Feb 15, 2026",
        bg: "bg-purple-500/10",
        tag: "bg-purple-500/20 text-purple-400"
    },
    {
        id: 3,
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8874683/",
        title: "How AI is Revolutionizing Food Safety and Transparency",
        excerpt: "Artificial intelligence is changing how we understand what we eat. From ingredient analysis to nutritional scoring, here's how AI tools like NutriLens are making food safer.",
        category: "Technology",
        readTime: "6 min read",
        date: "Feb 10, 2026",
        bg: "bg-blue-500/10",
        tag: "bg-blue-500/20 text-blue-400"
    },
    {
        id: 4,
        url: "https://www.downtoearth.org.in/food/what-s-in-your-food-additives-in-packaged-food",
        title: "Top 10 Most Harmful Additives Found in Indian Packaged Foods",
        excerpt: "Indian packaged foods often contain additives that are banned in other countries. We analyzed thousands of products to bring you the top 10 most concerning ones.",
        category: "Research",
        readTime: "9 min read",
        date: "Feb 5, 2026",
        bg: "bg-yellow-500/10",
        tag: "bg-yellow-500/20 text-yellow-400"
    },
    {
        id: 5,
        url: "https://www.fssai.gov.in/upload/uploadfiles/files/Guidance_Document_Labelling.pdf",
        title: "Understanding Nutritional Labels: A Complete Guide for Indian Consumers",
        excerpt: "FSSAI has specific requirements for food labeling in India. Learn how to read and interpret nutritional labels to make better choices for you and your family.",
        category: "Guide",
        readTime: "8 min read",
        date: "Jan 28, 2026",
        bg: "bg-green-500/10",
        tag: "bg-green-500/20 text-green-400"
    },
    {
        id: 6,
        url: "https://www.unep.org/resources/report/single-use-plastics-roadmap-sustainability",
        title: "Eco-Friendly Packaging: How to Choose Products That Don't Harm the Planet",
        excerpt: "Your purchasing decisions have a direct impact on the environment. Learn how to identify truly eco-friendly packaging and avoid greenwashing.",
        category: "Sustainability",
        readTime: "5 min read",
        date: "Jan 20, 2026",
        bg: "bg-teal-500/10",
        tag: "bg-teal-500/20 text-teal-400"
    },
]

const categories = ["All", "Health", "Ingredients", "Technology", "Research", "Guide", "Sustainability"]

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState("All")
    const [subscribeEmail, setSubscribeEmail] = useState("")
    const [isSubscribing, setIsSubscribing] = useState(false)

    const filteredPosts = activeCategory === "All"
        ? blogPosts
        : blogPosts.filter(post => post.category === activeCategory)

    const featuredPost = filteredPosts[0]
    const gridPosts = filteredPosts.slice(1)

    const handleSubscribe = async () => {
        if (!subscribeEmail || !subscribeEmail.includes('@')) {
            toast.error("Please enter a valid email address")
            return
        }
        setIsSubscribing(true)
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: subscribeEmail })
            })
            if (response.ok) {
                toast.success("🎉 You're subscribed! We'll keep you informed.")
                setSubscribeEmail("")
            } else {
                toast.error("Failed to subscribe. Try again.")
            }
        } catch {
            toast.error("Failed to subscribe. Try again.")
        } finally {
            setIsSubscribing(false)
        }
    }

    return (
        <div className="min-h-screen dark:bg-black bg-white text-default-foreground">

            {/* Hero */}
            <section className="relative w-full py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
                            <BookOpen className="w-4 h-4" />
                            NutriLens Blog
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Know what you{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                eat & drink
                            </span>
                        </h1>
                        <p className="text-lg dark:text-zinc-400 text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                            Expert articles on food safety, ingredient science, nutrition, and sustainable living — helping you make smarter choices every day.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-6xl mx-auto px-4 mb-10">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${activeCategory === cat
                                    ? 'bg-purple-500 text-white'
                                    : 'dark:bg-zinc-900 bg-zinc-100 dark:text-zinc-400 text-zinc-600 dark:hover:bg-zinc-800 hover:bg-zinc-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Featured Post */}
            {featuredPost && (
                <section className="max-w-6xl mx-auto px-4 mb-10">
                    <motion.div
                        key={featuredPost.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 mb-4">
                            Featured
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 max-w-2xl">
                            {featuredPost.title}
                        </h2>
                        <p className="dark:text-zinc-400 text-zinc-600 mb-6 max-w-2xl">
                            {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm dark:text-zinc-500 text-zinc-400">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {featuredPost.readTime}
                            </span>
                            <span>{featuredPost.date}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${featuredPost.tag}`}>
                                {featuredPost.category}
                            </span>
                        </div>
                        <Link
                            href={featuredPost.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex items-center gap-2 text-indigo-400 font-medium hover:gap-3 transition-all"
                        >
                            Read Article <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </section>
            )}

            {/* Blog Grid */}
            {gridPosts.length > 0 && (
                <section className="max-w-6xl mx-auto px-4 mb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gridPosts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-6 rounded-2xl border ${post.bg} dark:border-zinc-800 border-zinc-200 hover:scale-[1.02] transition-transform duration-200 flex flex-col`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${post.tag}`}>
                                        {post.category}
                                    </span>
                                    <span className="text-xs dark:text-zinc-500 text-zinc-400">{post.date}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-2 leading-snug flex-1">{post.title}</h3>
                                <p className="text-sm dark:text-zinc-400 text-zinc-600 mb-4 leading-relaxed line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-zinc-800 border-zinc-200">
                                    <span className="flex items-center gap-1 text-xs dark:text-zinc-500 text-zinc-400">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime}
                                    </span>
                                    <Link
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:gap-2 transition-all"
                                    >
                                        Read <ArrowRight className="w-3 h-3 text-purple-400" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state */}
            {filteredPosts.length === 0 && (
                <div className="max-w-6xl mx-auto px-4 mb-24 text-center py-20">
                    <p className="dark:text-zinc-500 text-zinc-400 text-lg">No articles found in this category yet.</p>
                </div>
            )}

            {/* Newsletter */}
            <section className="max-w-3xl mx-auto px-4 mb-24 text-center">
                <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <h2 className="text-3xl font-bold mb-3">Stay informed</h2>
                    <p className="dark:text-zinc-400 text-zinc-600 mb-8">
                        Get the latest articles on food safety and health delivered to your inbox.
                    </p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            value={subscribeEmail}
                            onChange={(e) => setSubscribeEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-full dark:bg-zinc-900 bg-zinc-100 border dark:border-zinc-700 border-zinc-300 text-sm outline-none focus:border-purple-500"
                        />
                        <button
                            onClick={handleSubscribe}
                            disabled={isSubscribing}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
                        >
                            {isSubscribing ? "Subscribing..." : "Subscribe"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}