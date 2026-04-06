import { ResponsivePie } from '@nivo/pie'
import { Chip } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { IngredientsChartProps } from '@/types/product.types';
import { colorPalette } from '@/data/constants';

export const IngredientsChart = ({ ingredients }: IngredientsChartProps) => {
    const { theme } = useTheme();

    if (!ingredients.length) {
        return (
            <div className="flex justify-center items-center w-full h-[90vh]">
                <Chip className="bg-yellow-500/20 text-yellow-500" size="lg">
                    No ingredients data available
                </Chip>
            </div>
        );
    }

    // Only treat % as real quantity — ml/g/mg are not valid for pie distribution
    const processQuantity = (qty?: string) => {
        if (!qty || qty === 'Unknown') return null;
        if (!qty.includes('%')) return null;
        const numValue = parseFloat(qty.replace('%', ''));
        return isNaN(numValue) ? null : numValue;
    };

    const assignEstimatedPercentages = (items: typeof ingredients) => {
        const weights = items.map((_, i) => Math.pow(0.65, i));
        const weightSum = weights.reduce((a, b) => a + b, 0);
        return weights.map(w => Math.round((w / weightSum) * 100));
    };

    const sortedIngredients = [...ingredients].sort((a, b) => {
        const qa = processQuantity(a.quantity);
        const qb = processQuantity(b.quantity);
        if (qa === null && qb === null) return 0;
        if (qa === null) return 1;
        if (qb === null) return -1;
        return qb - qa;
    });

    const hasRealPercentages = sortedIngredients.some(ing => processQuantity(ing.quantity) !== null);
    const realSum = hasRealPercentages
        ? sortedIngredients.reduce((sum, ing) => sum + (processQuantity(ing.quantity) ?? 0), 0)
        : 0;
    const useEstimated = !hasRealPercentages || realSum < 50;
    const estimatedPercentages = assignEstimatedPercentages(sortedIngredients);

    const chartData = sortedIngredients.map((ing, index) => {
        const actualQty = processQuantity(ing.quantity);
        const estimated = estimatedPercentages[index] ?? 1;
        const value = useEstimated ? estimated : (actualQty ?? estimated);
        const displayLabel = useEstimated ? `~${estimated}%` : `${actualQty}%`;

        return {
            id: ing.simplifiedName || ing.name,
            label: displayLabel,
            value,
            quantity: !useEstimated && actualQty !== null
                ? `${actualQty}%`
                : `~${estimated}% (estimated)`,
            originalQty: ing.quantity,
        };
    });

    return (
        <div className="flex flex-col w-full h-full">
            {useEstimated && (
                <Chip
                    className="self-center mb-4 bg-yellow-500/20 text-yellow-500 text-xs md:text-lg"
                    size="lg"
                >
                    Showing estimated distribution based on ingredient order
                </Chip>
            )}

            <div className="flex flex-col md:flex-row w-full h-auto md:h-[470px] gap-6 p-4">
                {/* Pie Chart */}
                <div className="w-full md:w-2/3 h-[300px] md:h-full">
                    <ResponsivePie
                        data={chartData}
                        margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
                        innerRadius={0.35}
                        padAngle={1}
                        cornerRadius={4}
                        colors={colorPalette}
                        borderWidth={2}
                        borderColor={theme === 'dark' ? '#18181b' : '#f3f4f6'}
                        enableArcLinkLabels={true}
                        arcLinkLabelsSkipAngle={8}
                        arcLinkLabelsColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsTextColor={theme === 'dark' ? '#d4d4d8' : '#3f3f46'}
                        arcLabelsSkipAngle={12}
                        arcLabelsTextColor="#ffffff"
                        arcLabel="label"
                        tooltip={({ datum }) => (
                            <div className="bg-white dark:bg-zinc-800 px-3 py-2 rounded-lg shadow-lg border dark:border-zinc-700">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: datum.color }}
                                    />
                                    <span className="text-black dark:text-white font-medium text-sm">
                                        {datum.id}
                                    </span>
                                </div>
                                <span className="text-xs dark:text-zinc-400 text-zinc-500 ml-5">
                                    {datum.data.quantity}
                                </span>
                            </div>
                        )}
                    />
                </div>

                {/* Ingredients List */}
                <div className="w-full md:w-1/3 h-[300px] md:h-full overflow-y-auto rounded-xl dark:bg-zinc-900 bg-zinc-100 p-4">
                    <h3 className="text-xl font-semibold mb-4 text-center">Ingredients List</h3>
                    <div className="space-y-2">
                        {sortedIngredients.map((ing, index) => {
                            const actualQty = processQuantity(ing.quantity);
                            const estimated = estimatedPercentages[index] ?? 1;
                            const displayQty = useEstimated
                                ? `~${estimated}%`
                                : actualQty !== null
                                    ? `${actualQty}%`
                                    : `~${estimated}%`;

                            return (
                                <div
                                    key={ing.name + index}
                                    className="flex items-center justify-between p-3 rounded-lg dark:bg-zinc-800 bg-zinc-200"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium text-sm truncate">
                                                {ing.simplifiedName || ing.name}
                                            </span>
                                            {ing.purpose && ing.purpose !== 'Unknown' && (
                                                <span className="text-xs opacity-50 truncate">
                                                    {ing.purpose}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs opacity-75 ml-2 flex-shrink-0">
                                        {displayQty}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};