import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { NutritionTableProps } from "@/types/product.types";
import { Chip } from "@nextui-org/react"
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

    const sortedNutrition = [...validNutrition].sort((a, b) => {
        return (processAmount(b.amount) || 0) - (processAmount(a.amount) || 0);
    });

    return (
        <div className="w-full md:h-[500px] overflow-y-auto">
            <Table className="table-fixed min-w-[500px]">
                <TableCaption>Nutritional Information</TableCaption>
                <TableHeader className="sticky top-0 dark:bg-background bg-zinc-200 z-10">
                    <TableRow>
                        <TableHead className="w-[5%] min-w-[30px] font-bold"></TableHead>
                        <TableHead className="w-[25%] min-w-[150px] font-bold">Nutrient</TableHead>
                        <TableHead className="w-[25%] min-w-[150px] font-bold">Amount</TableHead>
                        <TableHead className="w-[15%] min-w-[100px] font-bold">Unit</TableHead>
                        <TableHead className="w-[25%] min-w-[150px] font-bold">Daily Value %</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedNutrition.map((nutrition, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                            <TableCell>
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
                                />
                            </TableCell>
                            <TableCell className="font-medium">{nutrition.nutrient}</TableCell>
                            <TableCell className="font-semibold">{nutrition.amount}</TableCell>
                            <TableCell>{nutrition.unit}</TableCell>
                            <TableCell>
                                {nutrition.percentDailyValue
                                    ? <Chip size="sm" className="bg-blue-500/20 text-blue-400">{nutrition.percentDailyValue}</Chip>
                                    : '-'
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};