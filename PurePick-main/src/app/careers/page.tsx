'use client'

import { motion } from 'framer-motion'
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users, Globe } from 'lucide-react'
import Link from 'next/link'

const openings = [
    {
        id: 1,
        role: "Full Stack Developer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        description: "Build and scale NutriLens's core platform. Work with Next.js, TypeScript, and AI integrations.",
        tag: "bg-blue-500/20 text-blue-400"
    },
    {
        id: 2,
        role: "AI/ML Engineer",
        department: "AI Research",
        location: "Remote",
        type: "Full-time",
        description: "Develop and improve our ingredient analysis and food safety AI models.",
        tag: "bg-purple-500/20 text-purple-400"
    },
    {
        id: 3,
        role: "Nutrition Science Researcher",
        department: "Research",
        location: "Hybrid · Bhopal",
        type: "Full-time",
        description: "Research food additives, ingredients, and their health impacts for Indian consumers.",
        tag: "bg-green-500/20 text-green-400"
    },
    {
        id: 4,
        role: "UI/UX Designer",
        department: "Design",
        location: "Remote",
        type: "Part-time",
        description: "Design intuitive and beautiful interfaces that help users make healthier food choices.",
        tag: "bg-pink-500/20 text-pink-400"
    },
    {
        id: 5,
        role: "Content Writer – Food & Health",
        department: "Content",
        location: "Remote",
        type: "Freelance",
        description: "Write expert articles on food safety, nutrition, and sustainable living for our blog.",
        tag: "bg-yellow-500/20 text-yellow-400"
    },
]

const perks = [
    { icon: <Globe className="w-5 h-5" />, title: "100% Remote", desc: "Work from anywhere in the world" },
    { icon: <Heart className="w-5 h-5" />, title: "Health First", desc: "We care about your wellbeing" },
    { icon: <Zap className="w-5 h-5" />, title: "Fast Growth", desc: "Grow with an early-stage startup" },
    { icon: <Users className="w-5 h-5" />, title: "Small Team", desc: "High impact, low bureaucracy" },
]

export default function CareersPage() {
    return (
        <div className="min-h-screen dark:bg-black bg-white">

            {/* Hero */}
            <section className="relative w-full py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
                            <Briefcase className="w-4 h-4" />
                            We're Hiring
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Join the{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                NutriLens
                            </span>{' '}
                            Mission
                        </h1>
                        <p className="text-lg dark:text-zinc-400 text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                            Help us build a world where everyone knows exactly what's in their food. We're a small, passionate team making a big impact on food transparency in India.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Perks */}
            <section className="max-w-6xl mx-auto px-4 mb-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {perks.map((perk, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-2xl dark:bg-zinc-900 bg-zinc-50 border dark:border-zinc-800 border-zinc-200 text-center"
                        >
                            <div className="inline-flex p-2 rounded-xl bg-purple-500/10 text-purple-400 mb-3">
                                {perk.icon}
                            </div>
                            <h3 className="font-semibold mb-1">{perk.title}</h3>
                            <p className="text-xs dark:text-zinc-500 text-zinc-500">{perk.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Open Roles */}
            <section className="max-w-6xl mx-auto px-4 mb-24">
                <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
                <div className="flex flex-col gap-4">
                    {openings.map((job, i) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-2xl dark:bg-zinc-900 bg-zinc-50 border dark:border-zinc-800 border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-500/40 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.tag}`}>
                                        {job.department}
                                    </span>
                                    <span className="text-xs dark:text-zinc-500 text-zinc-400">{job.type}</span>
                                </div>
                                <h3 className="text-lg font-bold mb-1">{job.role}</h3>
                                <p className="text-sm dark:text-zinc-400 text-zinc-600 mb-3">{job.description}</p>
                                <div className="flex items-center gap-4 text-xs dark:text-zinc-500 text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {job.type}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={`mailto:asatianmol78@gmail.com?subject=Application for ${job.role} at NutriLens`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                                Apply Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* No role CTA */}
            <section className="max-w-3xl mx-auto px-4 mb-24 text-center">
                <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <h2 className="text-2xl font-bold mb-3">Don't see a role that fits?</h2>
                    <p className="dark:text-zinc-400 text-zinc-600 mb-6">
                        We're always looking for talented people. Send us your resume and we'll reach out when something opens up.
                    </p>
                    <Link
                        href="mailto:asatianmol78@gmail.com?subject=General Application - NutriLens"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                        Send Open Application <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    )
}