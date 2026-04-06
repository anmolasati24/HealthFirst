import { IngredientsTableProps } from "@/types/product.types";
import { Chip } from "@nextui-org/react";
import { colorPalette } from "@/data/constants";
import { ShieldCheck, Droplets, Zap, Leaf, FlaskConical, Palette, Cookie, AlertTriangle, Search, Copy, Check, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useState, useMemo } from "react";

const ingredientPurposes: Record<string, string> = {
    "carbonated water": "Base Liquid",
    "water": "Base Liquid",
    "sugar": "Sweetener",
    "salt": "Flavor Enhancer",
    "glucose": "Sweetener",
    "fructose": "Sweetener",
    "sucrose": "Sweetener",
    "acidity regulator": "Acidity Regulator",
    "acidity regulators": "Acidity Regulator",
    "citric acid": "Acidity Regulator",
    "sodium benzoate": "Preservative",
    "preservative": "Preservative",
    "sweetener": "Sweetener",
    "natural flavour": "Flavoring Agent",
    "natural flavours": "Flavoring Agent",
    "artificial flavour": "Flavoring Agent",
    "flavours": "Flavoring Agent",
    "caramel color": "Coloring Agent",
    "caffeine": "Stimulant",
    "phosphoric acid": "Acidity Regulator",
    "potassium sorbate": "Preservative",
    "ascorbic acid": "Antioxidant",
    "vitamin c": "Antioxidant",
    "lecithin": "Emulsifier",
    "soy lecithin": "Emulsifier",
    "palm oil": "Fat / Oil",
    "vegetable oil": "Fat / Oil",
    "wheat flour": "Base Ingredient",
    "milk": "Dairy Base",
    "cocoa": "Flavoring Agent",
    "cocoa powder": "Flavoring Agent",
    "corn starch": "Thickener",
    "modified starch": "Thickener",
    "xanthan gum": "Stabilizer",
    "gelatin": "Gelling Agent",
    "pectin": "Gelling Agent",
    "sodium chloride": "Flavor Enhancer",
};

const eNumberRestrictions: Record<string, { countries: string[]; reason: string }> = {
    "e211": { countries: ["EU"], reason: "May cause hyperactivity in children" },
    "e102": { countries: ["EU", "Norway"], reason: "Tartrazine - linked to hyperactivity" },
    "e110": { countries: ["EU"], reason: "Sunset Yellow - allergic reactions" },
    "e124": { countries: ["EU"], reason: "Ponceau 4R - linked to hyperactivity" },
    "e950": { countries: [], reason: "Approved globally but controversial" },
    "e951": { countries: [], reason: "Aspartame - controversial, avoid with PKU" },
    "e621": { countries: [], reason: "MSG - sensitivity in some individuals" },
};

const healthDetails: Record<string, { effects: string[]; interactions: string[]; tip: string }> = {
    "Sweetener": {
        effects: ["May spike blood sugar levels", "Can contribute to tooth decay", "Excess linked to obesity"],
        interactions: ["May interact with diabetes medications", "Affects insulin response"],
        tip: "Limit daily intake to under 25g as per WHO guidelines"
    },
    "Preservative": {
        effects: ["Extends shelf life", "May cause allergic reactions", "Some linked to hyperactivity in children"],
        interactions: ["May react with Vitamin C to form benzene", "Avoid with aspirin sensitivity"],
        tip: "Check for sensitivity, especially in children"
    },
    "Base Liquid": {
        effects: ["Essential for hydration", "Carbonation may cause bloating"],
        interactions: ["None significant"],
        tip: "Safe for most people"
    },
    "Acidity Regulator": {
        effects: ["Maintains pH balance", "May erode tooth enamel", "Can cause digestive discomfort"],
        interactions: ["May reduce absorption of calcium"],
        tip: "Rinse mouth after consuming acidic beverages"
    },
    "Flavoring Agent": {
        effects: ["Enhances taste", "Artificial variants may cause sensitivities"],
        interactions: ["Some may trigger migraines"],
        tip: "Natural flavors generally safer than artificial"
    },
    "Coloring Agent": {
        effects: ["No nutritional value", "Some linked to hyperactivity", "May cause allergic reactions"],
        interactions: ["Avoid with antihistamines"],
        tip: "Opt for products with natural colorings"
    },
    "Antioxidant": {
        effects: ["Prevents oxidation", "Protects cells from damage", "May boost immunity"],
        interactions: ["High doses may interact with blood thinners"],
        tip: "Generally beneficial in moderate amounts"
    },
    "Stimulant": {
        effects: ["Increases alertness", "May cause insomnia", "Can raise heart rate"],
        interactions: ["Interacts with caffeine medications", "Avoid with heart conditions"],
        tip: "Limit to 400mg caffeine per day for adults"
    },
    "Emulsifier": {
        effects: ["Helps blend ingredients", "May affect gut microbiome at high doses"],
        interactions: ["Generally safe"],
        tip: "Safe in food quantities"
    },
    "Food Ingredient": {
        effects: ["General food component"],
        interactions: ["No known significant interactions"],
        tip: "Generally recognized as safe"
    },
};

const purposeConfig: Record<string, { color: string; bg: string; icon: any; safety: string; safetyColor: string; dotColor: string }> = {
    "Sweetener": { color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/30", icon: Cookie, safety: "Moderate", safetyColor: "text-yellow-400", dotColor: "bg-yellow-400" },
    "Preservative": { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: ShieldCheck, safety: "Caution", safetyColor: "text-red-400", dotColor: "bg-red-400" },
    "Base Liquid": { color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30", icon: Droplets, safety: "Safe", safetyColor: "text-green-400", dotColor: "bg-green-400" },
    "Acidity Regulator": { color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", icon: FlaskConical, safety: "Moderate", safetyColor: "text-yellow-400", dotColor: "bg-yellow-400" },
    "Flavoring Agent": { color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30", icon: Zap, safety: "Moderate", safetyColor: "text-yellow-400", dotColor: "bg-yellow-400" },
    "Coloring Agent": { color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30", icon: Palette, safety: "Caution", safetyColor: "text-red-400", dotColor: "bg-red-400" },
    "Antioxidant": { color: "text-green-400", bg: "bg-green-500/15 border-green-500/30", icon: Leaf, safety: "Safe", safetyColor: "text-green-400", dotColor: "bg-green-400" },
    "Emulsifier": { color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30", icon: FlaskConical, safety: "Safe", safetyColor: "text-green-400", dotColor: "bg-green-400" },
    "Stimulant": { color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: Zap, safety: "Caution", safetyColor: "text-red-400", dotColor: "bg-red-400" },
    "Flavor Enhancer": { color: "text-teal-400", bg: "bg-teal-500/15 border-teal-500/30", icon: Zap, safety: "Moderate", safetyColor: "text-yellow-400", dotColor: "bg-yellow-400" },
    "Thickener": { color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30", icon: FlaskConical, safety: "Safe", safetyColor: "text-green-400", dotColor: "bg-green-400" },
    "Stabilizer": { color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30", icon: ShieldCheck, safety: "Safe", safetyColor: "text-green-400", dotColor: "bg-green-400" },
    "Food Ingredient": { color: "text-zinc-400", bg: "bg-zinc-500/15 border-zinc-500/30", icon: Cookie, safety: "Safe", safetyColor: "text-green-400", dotColor: "bg-green-400" },
};

const getPurpose = (name: string, existingPurpose?: string): string => {
    if (existingPurpose && existingPurpose !== 'Unknown' && existingPurpose !== '-') return existingPurpose;
    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(ingredientPurposes)) {
        if (lower.includes(key)) return value;
    }
    return "Food Ingredient";
};

const getSimplifiedName = (name: string, existingSimplified?: string): string => {
    if (existingSimplified && existingSimplified !== name && existingSimplified !== 'Unknown') return existingSimplified;
    return name.replace(/\(.*?\)/g, '').replace(/e\d{3}/gi, '').trim() || name;
};

const getPurposeConfig = (purpose: string) => {
    for (const [key, config] of Object.entries(purposeConfig)) {
        if (purpose.toLowerCase().includes(key.toLowerCase())) return config;
    }
    return purposeConfig["Food Ingredient"];
};

const getENumberRestriction = (name: string) => {
    const eMatch = name.toLowerCase().match(/e\d{3,4}/);
    if (!eMatch) return null;
    return eNumberRestrictions[eMatch[0]] || null;
};

const getHealthDetails = (purpose: string) => {
    for (const [key, details] of Object.entries(healthDetails)) {
        if (purpose.toLowerCase().includes(key.toLowerCase())) return details;
    }
    return healthDetails["Food Ingredient"];
};

const processQuantity = (qty?: string) => {
    if (!qty || qty === 'Unknown') return null;
    const numValue = parseFloat(qty.replace?.('%', '') || '');
    return isNaN(numValue) ? null : numValue;
};

export const IngredientsTable = ({ ingredients }: IngredientsTableProps) => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"All" | "Safe" | "Moderate" | "Caution">("All");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    // ✅ Hooks MUST come before any conditional return
    const sortedIngredients = useMemo(() => [...ingredients].sort((a, b) => {
        const qa = processQuantity(a.quantity);
        const qb = processQuantity(b.quantity);
        if (qa === null && qb === null) return 0;
        if (qa === null) return 1;
        if (qb === null) return -1;
        return qb - qa;
    }), [ingredients]);

    const filteredIngredients = useMemo(() => sortedIngredients.filter(ing => {
        const purpose = getPurpose(ing.name, ing.purpose);
        const config = getPurposeConfig(purpose);
        const matchesSearch =
            ing.name.toLowerCase().includes(search.toLowerCase()) ||
            (ing.simplifiedName || "").toLowerCase().includes(search.toLowerCase()) ||
            purpose.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "All" || config.safety === filter;
        return matchesSearch && matchesFilter;
    }), [sortedIngredients, search, filter]);

    // ✅ Early return AFTER all hooks
    if (!ingredients.length) {
        return (
            <div className="flex justify-center items-center w-full h-[90vh]">
                <Chip className="bg-yellow-500/20 text-yellow-500" size="lg">
                    No ingredients data available
                </Chip>
            </div>
        );
    }

    // Stats
    const safeCount = sortedIngredients.filter(ing => getPurposeConfig(getPurpose(ing.name, ing.purpose)).safety === 'Safe').length;
    const cautionCount = sortedIngredients.filter(ing => getPurposeConfig(getPurpose(ing.name, ing.purpose)).safety === 'Caution').length;
    const moderateCount = sortedIngredients.length - safeCount - cautionCount;
    const safePercent = Math.round((safeCount / sortedIngredients.length) * 100);

    const handleCopy = () => {
        const text = sortedIngredients.map(i => i.name).join(", ");
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full flex flex-col gap-4">

            {/* ── Search + Filter + Copy ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-zinc-500 text-zinc-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search ingredients, purpose..."
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900 bg-white dark:text-zinc-200 text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["All", "Safe", "Moderate", "Caution"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === f
                                ? "dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 border-transparent"
                                : "dark:border-zinc-700 border-zinc-200 dark:text-zinc-400 text-zinc-500 hover:dark:border-zinc-500 hover:border-zinc-400"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-zinc-800 border-zinc-200 text-xs dark:text-zinc-400 text-zinc-500 hover:dark:border-zinc-600 hover:border-zinc-400 transition-all"
                >
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    {copied ? "Copied!" : "Copy list"}
                </button>
            </div>

            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total", value: sortedIngredients.length, dot: "bg-zinc-400" },
                    { label: "Safe", value: safeCount, dot: "bg-green-400" },
                    { label: "Moderate", value: moderateCount, dot: "bg-yellow-400" },
                    { label: "Caution", value: cautionCount, dot: "bg-red-400" },
                ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border dark:border-zinc-800 border-zinc-200 dark:bg-zinc-900/50 bg-zinc-50">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stat.dot}`} />
                        <div>
                            <p className="text-lg font-semibold dark:text-white text-zinc-800 leading-none">{stat.value}</p>
                            <p className="text-xs dark:text-zinc-500 text-zinc-400 mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Safety Progress Bar ── */}
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs dark:text-zinc-500 text-zinc-400">
                    <span>Safety breakdown</span>
                    <span>{safePercent}% safe</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden dark:bg-zinc-800 bg-zinc-200 flex">
                    <div style={{ width: `${safePercent}%` }} className="bg-green-400 h-full transition-all duration-500" />
                    <div style={{ width: `${Math.round((moderateCount / sortedIngredients.length) * 100)}%` }} className="bg-yellow-400 h-full transition-all duration-500" />
                    <div style={{ width: `${Math.round((cautionCount / sortedIngredients.length) * 100)}%` }} className="bg-red-400 h-full transition-all duration-500" />
                </div>
            </div>

            {/* ── Results count ── */}
            {search || filter !== "All" ? (
                <p className="text-xs dark:text-zinc-500 text-zinc-400">
                    Showing {filteredIngredients.length} of {sortedIngredients.length} ingredients
                </p>
            ) : null}

            {/* ── Table ── */}
            <div className="w-full rounded-xl border dark:border-zinc-800 border-zinc-200 overflow-hidden">

                {/* Header */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 dark:bg-zinc-900 bg-zinc-100 border-b dark:border-zinc-800 border-zinc-200 sticky top-0 z-10">
                    {["#", "Ingredient", "Common name", "Quantity", "Purpose", "Safety"].map((h, i) => (
                        <div key={h} className={`text-xs font-bold uppercase tracking-widest dark:text-zinc-500 text-zinc-400 ${i === 0 ? "col-span-1" :
                            i === 1 ? "col-span-3" :
                                i === 2 ? "col-span-2" :
                                    i === 3 ? "col-span-2" :
                                        i === 4 ? "col-span-2" : "col-span-2"
                            }`}>{h}</div>
                    ))}
                </div>

                {/* Rows */}
                <div className="divide-y dark:divide-zinc-800/50 divide-zinc-100 md:max-h-[500px] overflow-y-auto">
                    {filteredIngredients.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm dark:text-zinc-500 text-zinc-400">No ingredients match your search</p>
                        </div>
                    ) : filteredIngredients.map((ingredient, index) => {
                        const originalIndex = sortedIngredients.indexOf(ingredient);
                        const purpose = getPurpose(ingredient.name, ingredient.purpose);
                        const simplified = getSimplifiedName(ingredient.name, ingredient.simplifiedName);
                        const config = getPurposeConfig(purpose);
                        const Icon = config.icon;
                        const hasQuantity = ingredient.quantity && ingredient.quantity !== 'Unknown';
                        const restriction = getENumberRestriction(ingredient.name);
                        const health = getHealthDetails(purpose);
                        const isExpanded = expandedIndex === originalIndex;

                        return (
                            <div key={index}>
                                {/* Main Row */}
                                <div
                                    onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                                    className={`grid grid-cols-12 gap-2 px-4 py-4 items-center cursor-pointer transition-colors duration-150 ${isExpanded
                                        ? "dark:bg-zinc-900/80 bg-zinc-50"
                                        : "dark:hover:bg-zinc-900/60 hover:bg-zinc-50"
                                        }`}
                                >
                                    {/* Index */}
                                    <div className="col-span-1 flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: colorPalette[originalIndex % colorPalette.length],
                                                outline: `2px solid ${colorPalette[originalIndex % colorPalette.length]}40`,
                                                outlineOffset: '2px'
                                            }}
                                        />
                                        <span className="text-xs dark:text-zinc-600 text-zinc-400 font-mono hidden sm:block">
                                            {String(originalIndex + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <div className="col-span-3 flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-semibold text-sm dark:text-white text-zinc-800 leading-tight">
                                                {ingredient.name}
                                            </span>
                                            {restriction && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30">
                                                    <Globe size={10} />
                                                    Restricted
                                                </span>
                                            )}
                                        </div>
                                        {originalIndex === 0 && (
                                            <span className="text-xs text-indigo-400 font-medium">Primary ingredient</span>
                                        )}
                                    </div>

                                    {/* Simplified */}
                                    <div className="col-span-2">
                                        {simplified !== ingredient.name ? (
                                            <span className="text-sm dark:text-zinc-400 text-zinc-500">{simplified}</span>
                                        ) : (
                                            <span className="text-xs dark:text-zinc-600 text-zinc-400 italic">—</span>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2">
                                        {hasQuantity ? (
                                            <span className="text-sm font-medium dark:text-zinc-200 text-zinc-700 font-mono">
                                                {ingredient.quantity}
                                            </span>
                                        ) : (
                                            <span className="text-xs dark:text-zinc-600 text-zinc-400 italic">Not listed</span>
                                        )}
                                    </div>

                                    {/* Purpose */}
                                    <div className="col-span-2">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.bg} ${config.color}`}>
                                            <Icon size={11} />
                                            <span className="hidden sm:block">{purpose}</span>
                                        </div>
                                    </div>

                                    {/* Safety + Expand */}
                                    <div className="col-span-2 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                                            <span className={`text-xs font-medium ${config.safetyColor}`}>
                                                {config.safety}
                                            </span>
                                        </div>
                                        {isExpanded
                                            ? <ChevronUp size={14} className="dark:text-zinc-500 text-zinc-400" />
                                            : <ChevronDown size={14} className="dark:text-zinc-500 text-zinc-400" />
                                        }
                                    </div>
                                </div>

                                {/* ── Expanded Panel ── */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 dark:bg-zinc-900/40 bg-zinc-50/80 border-t dark:border-zinc-800/50 border-zinc-100">
                                        <div className="ml-8 grid grid-cols-1 sm:grid-cols-3 gap-4">

                                            {/* Health Effects */}
                                            <div className="flex flex-col gap-2">
                                                <p className="text-xs font-semibold dark:text-zinc-400 text-zinc-500 uppercase tracking-wider">Health effects</p>
                                                <ul className="flex flex-col gap-1.5">
                                                    {health.effects.map((e, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs dark:text-zinc-300 text-zinc-600">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                                                            {e}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Interactions */}
                                            <div className="flex flex-col gap-2">
                                                <p className="text-xs font-semibold dark:text-zinc-400 text-zinc-500 uppercase tracking-wider">Interactions</p>
                                                <ul className="flex flex-col gap-1.5">
                                                    {health.interactions.map((e, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs dark:text-zinc-300 text-zinc-600">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                                            {e}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Tip + Restriction */}
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <p className="text-xs font-semibold dark:text-zinc-400 text-zinc-500 uppercase tracking-wider">Tip</p>
                                                    <p className="text-xs dark:text-zinc-300 text-zinc-600 leading-relaxed">
                                                        {health.tip}
                                                    </p>
                                                </div>
                                                {restriction && (
                                                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                        <div className="flex items-center gap-1.5">
                                                            <Globe size={12} className="text-orange-400" />
                                                            <p className="text-xs font-semibold text-orange-400">
                                                                Restricted in: {restriction.countries.join(", ") || "Some regions"}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-orange-300/80">{restriction.reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 dark:bg-zinc-900/30 bg-zinc-50 border-t dark:border-zinc-800 border-zinc-200">
                    <p className="text-xs dark:text-zinc-600 text-zinc-400 text-center">
                        Ingredients listed in descending order by quantity as required by FSSAI regulations. Click any row to see health details.
                    </p>
                </div>
            </div>
        </div>
    );
};
