import { ResponsivePie } from '@nivo/pie'
import { Chip } from '@nextui-org/react'
import { useTheme } from 'next-themes'
import { NutritionChartProps } from '@/types/product.types';
import { colorPalette } from '@/data/constants';

export const NutritionChart = ({ nutritionalValues }: NutritionChartProps) => {
    const { theme } = useTheme();

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
        return isNaN(numValue) || numValue <= 0 ? null : numValue;
    };

    // Filter out nutrients with no valid amount
    const validNutrition = nutritionalValues.filter(nut =>
        nut.nutrient && processAmount(nut.amount) !== null
    );

    if (!validNutrition.length) {
        return (
            <div className="flex justify-center items-center w-full h-[90vh]">
                <Chip className="bg-yellow-500/20 text-yellow-500" size="lg">
                    No nutritional data available
                </Chip>
            </div>
        );
    }

    // Exclude Energy from pie chart as it dominates (show in list only)
    const pieNutrition = validNutrition.filter(nut =>
        !['energy', 'calories', 'kcal'].some(e => nut.nutrient.toLowerCase().includes(e))
    );

    // If all are energy, show all
    const chartNutrition = pieNutrition.length > 0 ? pieNutrition : validNutrition;

    const sortedNutrition = [...chartNutrition].sort((a, b) => {
        return (processAmount(b.amount) || 0) - (processAmount(a.amount) || 0);
    });

    const chartData = sortedNutrition.map(nut => ({
        id: nut.nutrient,
        label: `${nut.amount}${nut.unit}`,
        value: processAmount(nut.amount) || 0,
        dailyValue: nut.percentDailyValue || '',
        unit: nut.unit
    }));

    // Energy nutrient for display
    const energyNutrient = validNutrition.find(nut =>
        ['energy', 'calories', 'kcal'].some(e => nut.nutrient.toLowerCase().includes(e))
    );

    return (
        <div className="flex flex-col w-full">
            {energyNutrient && (
                <div className="self-center mb-2">
                    <Chip className="bg-blue-500/20 text-blue-400" size="lg">
                        Energy: {energyNutrient.amount} {energyNutrient.unit} per serving
                    </Chip>
                </div>
            )}
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[470px] gap-6 p-4">
                <div className="w-full md:w-2/3 h-[300px] md:h-full">
                    <ResponsivePie
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                            ...(window.innerWidth > 768 && {
                                top: 40,
                                right: 80,
                                bottom: 40,
                                left: 80
                            })
                        }}
                        innerRadius={0.3}
                        padAngle={0.5}
                        cornerRadius={3}
                        colors={colorPalette}
                        borderWidth={2}
                        borderColor={theme === 'dark' ? '#1f2937' : '#f3f4f6'}
                        enableArcLinkLabels={window.innerWidth > 768}
                        arcLinkLabelsColor={{ from: 'color', modifiers: [['darker', 1]] }}
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsTextColor={theme === 'dark' ? '#ffffff' : '#000000'}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor="#ffffff"
                        arcLabel="label"
                        tooltip={({ datum }) => (
                            <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-lg border dark:border-zinc-700">
                                <span className="text-black dark:text-white font-medium">
                                    {datum.id}: {datum.value}{datum.data.unit}
                                    {datum.data.dailyValue ? ` (${datum.data.dailyValue} DV)` : ''}
                                </span>
                            </div>
                        )}
                    />
                </div>

                <div className="w-full md:w-1/3 h-[300px] md:h-full overflow-y-auto rounded-xl dark:bg-zinc-900 p-4">
                    <h3 className="text-xl font-semibold mb-4 text-center">Nutrition List</h3>
                    <div className="space-y-3">
                        {validNutrition.map((nut, index) => {
                            const isEnergy = ['energy', 'calories', 'kcal'].some(e =>
                                nut.nutrient.toLowerCase().includes(e)
                            );
                            return (
                                <div
                                    key={nut.nutrient}
                                    className="flex items-center justify-between p-3 rounded-lg dark:bg-zinc-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: isEnergy
                                                    ? '#60a5fa'
                                                    : colorPalette[index % colorPalette.length]
                                            }}
                                        />
                                        <span className="font-medium text-sm md:text-base">{nut.nutrient}</span>
                                    </div>
                                    <div className="text-xs md:text-sm opacity-75 ml-2 flex-shrink-0">
                                        {nut.amount}{nut.unit}
                                        {nut.percentDailyValue ? ` (${nut.percentDailyValue})` : ''}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}