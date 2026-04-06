'use client'

import { Alternative } from "@/types/product.types"
import { Card, CardBody, CardFooter, Chip, Button } from "@nextui-org/react"
import { ExternalLink, Package } from "lucide-react"
import { useState } from "react"

const AlternativeCard = ({ alt }: { alt: Alternative, index: number }) => {
    const [imgError, setImgError] = useState(false);

    const ratingColor = alt.rating >= 8
        ? "bg-green-500/20 text-green-400"
        : alt.rating >= 6
            ? "bg-lime-500/20 text-lime-400"
            : "bg-yellow-500/20 text-yellow-400";

    return (
        <Card className="min-w-[280px] w-[280px] dark:bg-zinc-900 bg-zinc-100 border dark:border-zinc-800 border-zinc-200">
            <CardBody className="gap-3 p-4">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-base leading-tight">{alt.name}</h3>
                    <Chip variant="flat" size="sm" className={`flex-shrink-0 ${ratingColor}`}>
                        {alt.rating}/10
                    </Chip>
                </div>

                <div className="w-full h-48 relative rounded-xl overflow-hidden dark:bg-zinc-800 bg-zinc-200 flex items-center justify-center">
                    {alt.imageUrl && !imgError ? (
                        <img
                            src={alt.imageUrl}
                            alt={alt.name}
                            className="w-full h-full object-contain p-2"
                            onError={() => setImgError(true)}
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30">
                            <Package size={48} />
                            <span className="text-xs">{alt.name}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Chip size="sm" variant="flat" className="bg-indigo-500/20 text-indigo-400 text-xs">
                        🌱 Eco: {alt.eco_score}/10
                    </Chip>
                    <Chip size="sm" variant="flat" className="bg-purple-500/20 text-purple-400 text-xs">
                        💰 {alt.price_comparison}
                    </Chip>
                </div>

                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider dark:text-zinc-500 text-zinc-400 mb-2">Key Benefits</p>
                    <div className="flex flex-wrap gap-1.5">
                        {alt.key_benefits.slice(0, 3).map((benefit, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full dark:bg-zinc-800 bg-zinc-200 dark:text-zinc-300 text-zinc-600"
                            >
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>
            </CardBody>

            <CardFooter className="pt-0 px-4 pb-4">
                <Button
                    size="sm"
                    variant="solid"
                    className="w-full"
                    color="primary"
                    endContent={<ExternalLink size={14} />}
                    onClick={() => window.open(
                        alt.link || `https://www.amazon.in/s?k=${encodeURIComponent(alt.name)}`,
                        '_blank'
                    )}
                >
                    View Product
                </Button>
            </CardFooter>
        </Card>
    );
};

export const AlternativeProducts = ({ alternatives }: { alternatives: Alternative[] }) => {
    if (!alternatives?.length) return null;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Best Alternative Products</h2>
            <div className="md:px-3 pt-2">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {alternatives.map((alt, index) => (
                        <AlternativeCard key={index} alt={alt} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};