import { NutritionTableProps } from "@/types/product.types";
import { Chip } from "@nextui-org/react";
import { colorPalette } from "@/data/constants";

export const NutritionTable = ({ nutritionalValues }: NutritionTableProps) => {
    if (!nutritionalValues.length || !nutritionalValues[0].nutrient) {
        return (
            <div className="flex justify-center items-center w-full h-[90vh]">
                <Chip className="bg-yellow-500/20 text-yellow-500" size="lg">
                    No nutritional data available
                </Chip>
            </div>
        );
    }

    const processAmount = (amount?: string): number | null => {
        if (!amount || amount === '' || amount === 'undefined') return null;
        const numValue = parseFloat(amount);
        return isNaN(numValue) ? null : numValue;
    };

    const getNormalizedValue = (amount?: string, unit?: string): number => {
        const val = processAmount(amount) || 0;
        if (!unit) return val;
        const lowerUnit = unit.toLowerCase().trim();
        if (lowerUnit === 'mg') return val / 1000;
        if (lowerUnit === 'mcg' || lowerUnit === 'µg') return val / 1000000;
        if (lowerUnit === 'kg') return val * 1000;
        return val;
    };

    // Filter out nutrients with no valid amount or 0 value
    const validNutrition = nutritionalValues.filter(nut => {
        const val = processAmount(nut.amount);
        return val !== null && val > 0;
    });

    if (!validNutrition.length) {
        return (
            <div className="flex justify-center items-center w-full h-[90vh]">
                <Chip className="bg-yellow-500/20 text-yellow-500" size="lg">
                    No nutritional data available
                </Chip>
            </div>
        );
    }

    // Sort using normalized values
    const sortedNutrition = [...validNutrition].sort((a, b) => {
        return getNormalizedValue(b.amount, b.unit) - getNormalizedValue(a.amount, a.unit);
    });

    return (
        <div className="w-full rounded-2xl border dark:border-zinc-800/80 border-zinc-200 overflow-hidden bg-white dark:bg-[#111113] shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 dark:bg-[#18181b]/80 bg-zinc-50 border-b dark:border-zinc-800/80 border-zinc-200 sticky top-0 z-10 backdrop-blur-md">
                <div className="col-span-5 text-xs font-bold uppercase tracking-widest dark:text-zinc-400 text-zinc-500">Nutrient</div>
                <div className="col-span-3 text-xs font-bold uppercase tracking-widest dark:text-zinc-400 text-zinc-500">Amount</div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-widest dark:text-zinc-400 text-zinc-500">Unit</div>
                <div className="col-span-2 text-xs font-bold uppercase tracking-widest dark:text-zinc-400 text-zinc-500">Daily Value %</div>
            </div>

            {/* Rows */}
            <div className="divide-y dark:divide-zinc-800/40 divide-zinc-100 md:max-h-[500px] overflow-y-auto">
                {sortedNutrition.map((nutrition, index) => {
                    // Match color logic to pie chart list if possible (fallback to simple index rotation)
                    const isEnergy = ['energy', 'calories', 'kcal'].some(e =>
                        nutrition.nutrient.toLowerCase().includes(e)
                    );
                    const dotColor = isEnergy ? '#60a5fa' : colorPalette[validNutrition.indexOf(nutrition) % colorPalette.length];

                    return (
                        <div
                            key={index}
                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors duration-150 dark:hover:bg-zinc-800/30 hover:bg-zinc-50 group"
                        >
                            {/* Nutrient */}
                            <div className="col-span-5 flex items-center gap-4">
                                <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                                    style={{
                                        backgroundColor: dotColor,
                                    }}
                                />
                                <span className="font-semibold text-[15px] dark:text-zinc-100 text-zinc-800 leading-tight">
                                    {nutrition.nutrient}
                                </span>
                            </div>

                            {/* Amount */}
                            <div className="col-span-3">
                                <span className="font-bold text-[15px] dark:text-white text-zinc-900 font-mono tracking-tight">
                                    {nutrition.amount}
                                </span>
                            </div>

                            {/* Unit */}
                            <div className="col-span-2">
                                <span className="text-sm dark:text-zinc-400 text-zinc-500 font-medium">
                                    {nutrition.unit}
                                </span>
                            </div>

                            {/* Daily Value % */}
                            <div className="col-span-2">
                                {nutrition.percentDailyValue ? (
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                                        {nutrition.percentDailyValue}
                                    </span>
                                ) : (
                                    <span className="text-sm dark:text-zinc-600 text-zinc-400 font-medium ml-4">—</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};