'use client'

import { motion } from 'framer-motion'
import { Scan, Brain, Leaf, Shield, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const services = [
    {
        icon: Scan,
        title: "AI Product Scanning",
        description: "Instantly scan any product barcode or label using your camera. Our advanced AI extracts every detail visible on the packaging in seconds.",
        features: ["Barcode detection", "Label text extraction", "Multi-image analysis", "Real-time processing"],
        color: "from-blue-500 to-cyan-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        icon: Brain,
        title: "Deep Health Analysis",
        description: "Get comprehensive health insights powered by Llama AI. Understand exactly what you're consuming and how it affects your body.",
        features: ["Ingredient safety scores", "Nutritional breakdown", "Allergen detection", "Personalized risk assessment"],
        color: "from-purple-500 to-pink-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        icon: Leaf,
        title: "Eco Impact Rating",
        description: "Discover the environmental footprint of every product. Make sustainable choices with our detailed eco-impact scoring system.",
        features: ["Packaging analysis", "Carbon footprint estimate", "Sustainability score", "Disposal guidance"],
        color: "from-green-500 to-emerald-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    },
    {
        icon: Users,
        title: "Age Group Insights",
        description: "Tailored recommendations for every member of your family — from babies to seniors, know what's safe for everyone.",
        features: ["Baby safety (0-2 yrs)", "Children guidance (3-12)", "Teen recommendations", "Senior health tips"],
        color: "from-orange-500 to-yellow-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    },
    {
        icon: Shield,
        title: "Ingredient Safety Check",
        description: "Every ingredient is evaluated for safety, purpose, and health impact. Know what each chemical or additive actually does.",
        features: ["E-number identification", "Additive classification", "Safety ratings", "Purpose explanation"],
        color: "from-red-500 to-rose-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
    },
    {
        icon: Zap,
        title: "Smart Alternatives",
        description: "Never settle for unhealthy products. NutriLens suggests better alternatives so you can make smarter purchasing decisions.",
        features: ["Healthier substitutes", "Price comparison", "Side-by-side analysis", "Product comparison tool"],
        color: "from-indigo-500 to-violet-500",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20"
    }
]

const stats = [
    { value: "99%", label: "Accuracy Rate" },
    { value: "10s", label: "Analysis Time" },
    { value: "50K+", label: "Products Analyzed" },
    { value: "Free", label: "Always" },
]

export default function ServicesPage() {
    return (
        <div className="min-h-screen dark:bg-black bg-white text-default-foreground">

            {/* Hero */}
            <section className="relative w-full py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                            What We Offer
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Everything you need to{' '}
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                eat smarter
                            </span>
                        </h1>
                        <p className="text-lg dark:text-zinc-400 text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                            NutriLens combines AI vision, real-time databases, and health science to give you the most comprehensive product analysis available — completely free.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-4xl mx-auto px-4 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-6 rounded-2xl dark:bg-zinc-900 bg-zinc-100 border dark:border-zinc-800 border-zinc-200"
                        >
                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm dark:text-zinc-400 text-zinc-500">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Services Grid */}
            <section className="max-w-6xl mx-auto px-4 mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 rounded-2xl border ${service.bg} ${service.border} hover:scale-[1.02] transition-transform duration-200`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                                <service.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                            <p className="dark:text-zinc-400 text-zinc-600 text-sm mb-4 leading-relaxed">
                                {service.description}
                            </p>
                            <ul className="space-y-2">
                                {service.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm dark:text-zinc-300 text-zinc-700">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-3xl mx-auto px-4 mb-24 text-center">
                <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <h2 className="text-3xl font-bold mb-4">Ready to scan your first product?</h2>
                    <p className="dark:text-zinc-400 text-zinc-600 mb-8">
                        Join thousands of users making healthier choices with NutriLens.
                    </p>
                    <Link href="/">
                        <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity">
                            Start Scanning Free
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    )
}