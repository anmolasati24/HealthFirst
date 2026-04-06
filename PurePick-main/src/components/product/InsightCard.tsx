import { getBadgeClass, getRatingColorClass } from "@/utils/product-utils";
import { CustomChip } from "./CustomChip";
import { InsightCardProps } from "@/types/product.types";

export const InsightCard = ({
    title,
    startContent,
    ageRange,
    rating,
    reason,
    selectionLabel,
    cautions,
    risks,
    benefits,
}: InsightCardProps) => {
    return (
        <div className="flex flex-col w-full">

            {/* TOP SECTION */}
            <div className="w-full rounded-t-2xl dark:bg-zinc-900 bg-zinc-200 p-4">

                <div className="flex justify-start items-center gap-2 mb-3">
                    <CustomChip
                        variant="flat"
                        className={`gap-1 pl-0 ${getRatingColorClass(rating)}`}
                        size="md"
                        startContent={startContent}
                        endContent={
                            <span className={`px-1 flex justify-center items-center rounded-full ${getBadgeClass(rating)} text-white`}>
                                {rating}/10
                            </span>
                        }
                    >
                        {title}
                    </CustomChip>

                    {ageRange && (
                        <span className="font-light text-sm opacity-50">
                            {ageRange}
                        </span>
                    )}
                </div>

                {/* EXPANDED REASON */}
                {reason && (
                    <div className="text-sm md:text-base leading-relaxed space-y-2">
                        {reason.split(". ").map((line, index) => (
                            <p key={index} className="opacity-90">
                                {line.trim()}
                                {line.endsWith(".") ? "" : "."}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* CAUTIONS */}
            {cautions && cautions.length > 0 && (
                <div className="flex gap-2 w-full dark:bg-zinc-800 bg-zinc-300 p-3 flex-wrap rounded-b-2xl">
                    <span className="font-medium text-sm">
                        {selectionLabel || "Cautions"}
                    </span>

                    <div className="flex flex-wrap gap-2">
                        {cautions.map((caution, index) => (
                            <CustomChip
                                key={index}
                                variant="flat"
                                size="sm"
                                className="dark:bg-zinc-900"
                            >
                                {caution}
                            </CustomChip>
                        ))}
                    </div>
                </div>
            )}

            {/* RISKS */}
            {risks && risks.length > 0 && (
                <div className="flex gap-2 w-full dark:bg-zinc-800 bg-zinc-300 p-3 flex-wrap">
                    <span className="font-medium text-sm">Risks:</span>

                    <div className="flex flex-wrap gap-2">
                        {risks.map((risk, index) => (
                            <CustomChip
                                key={index}
                                variant="flat"
                                size="sm"
                                color="danger"
                            >
                                {risk}
                            </CustomChip>
                        ))}
                    </div>
                </div>
            )}

            {/* BENEFITS */}
            {benefits && benefits.length > 0 && (
                <div className="flex gap-2 w-full dark:bg-zinc-800 bg-zinc-300 p-3 flex-wrap rounded-b-2xl">
                    <span className="font-medium text-sm">Benefits:</span>

                    <div className="flex flex-wrap gap-2">
                        {benefits.map((benefit, index) => (
                            <CustomChip
                                key={index}
                                variant="flat"
                                size="sm"
                                color="success"
                            >
                                {benefit}
                            </CustomChip>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};