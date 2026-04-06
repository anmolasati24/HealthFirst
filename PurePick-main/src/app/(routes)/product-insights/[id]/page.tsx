'use client'

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@nextui-org/react";
import { ProductDetailsTable } from "@/components/product/ProductDetailsTable";
import { AlternativeProducts } from "@/components/product/AlternativeProducts";
import { SourcesCard } from "@/components/product/SourcesCard";
import { ProductChat } from "@/components/product/ProductChat";
import { TopLeft } from "@/components/product/TopLeft";
import { TopRight } from "@/components/product/TopRight";
import { ProductInsights, userDetails } from "@/types/product.types";
import { IngredientContainer } from "@/components/product/IngredientContainer";
import { NutritionContainer } from "@/components/product/NutritionContainer";
import { ComparisonModal } from "@/components/product/ComparisonModal";
import { Modal, Button, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { useRouter } from "next/navigation";

const ProductInsightPage = ({ params }: { params: { id: string } }) => {

    const { data: session, status } = useSession();
    const [productInsights, setProductInsights] = useState<ProductInsights>();
    const [userDetails, setUserDetails] = useState<userDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ Comparison state
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);
    const [allProducts, setAllProducts] = useState<ProductInsights[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [isFetchingProducts, setIsFetchingProducts] = useState(false);

    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        if (productInsights) {
            setTimeout(() => setIsLoading(false), 1000);
        }
    }, [productInsights]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                const response = await fetch(`/api/product-insights?productId=${id}&userId=${session?.user.id}`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    setIsModalOpen(true);
                    toast.error(data.error);
                    return;
                }

                setProductInsights(data.productInsight);

                if (data.productInsight?.userIdCopy) {
                    setUserDetails(data.productInsight.userIdCopy);
                }

            } catch (error) {
                toast.error("Something went wrong.");
            }
        };

        if (status === "loading") return;
        if (!session) {
            setIsModalOpen(true);
            return;
        }

        fetchData();
    }, [id, session, status]);

    // ✅ Fetch all user products for comparison
    const fetchAllProducts = async () => {
        // Don't fetch again if already loaded
        if (allProducts.length > 0) return;

        try {
            setIsFetchingProducts(true);
            console.log("Fetching products for userId:", session?.user.id);

            const response = await fetch(`/api/product-insights/all?userId=${session?.user.id}`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                // Exclude current product from comparison list
                setAllProducts(data.productInsights.filter((p: ProductInsights) => p._id !== id));
            } else {
                toast.error("Could not load products for comparison.");
            }
        } catch (error) {
            toast.error("Could not load products for comparison.");
        } finally {
            setIsFetchingProducts(false);
        }
    };

    // ✅ Fixed: now fetches products BEFORE opening modal
    const handleCompareClick = async () => {
        await fetchAllProducts();
        setIsComparisonOpen(true);
    };

    return (
        <>
            {!productInsights && !isModalOpen && (
                <Progress
                    isIndeterminate
                    aria-label="Loading..."
                    className="w-full"
                    size="sm"
                    color='primary'
                />
            )}

            <div className="w-full min-h-screen flex flex-col p-3 pb-0 border-b-2 dark:bg-black bg-white">

                {/* Access Denied Modal */}
                <Modal
                    className="text-default-foreground"
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                >
                    <ModalContent>
                        <ModalHeader>Access Denied</ModalHeader>
                        <ModalBody>
                            You are not authorized to view this product insight.
                        </ModalBody>
                        <ModalFooter>
                            <Button
    color="primary"
    onPress={() => {
        setIsModalOpen(false);
        router.push("/product-history");
    }}
>
    Go Back
</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* ✅ Comparison Modal */}
                {productInsights && (
                    <ComparisonModal
                        isOpen={isComparisonOpen}
                        onClose={() => setIsComparisonOpen(false)}
                        products={allProducts}
                        productInsights={productInsights}
                        selectedProductId={selectedProductId}
                        setSelectedProductId={setSelectedProductId}
                    />
                )}

                {/* Main Content */}
                {productInsights && (
                    <>
                        <div className="flex flex-col justify-center items-start md:flex-row gap-5 w-full h-full">
                            <TopLeft {...productInsights} />
                            <TopRight {...productInsights} />
                        </div>

                        <IngredientContainer ingredients={productInsights.productDetails.ingredients} />

                        <NutritionContainer nutrition={productInsights.productDetails.nutrition} />

                        <div className="w-full flex flex-col justify-center items-center md:px-3 mt-16 text-default-foreground">
                            <div className="w-full h-full">
                                <h2 className="text-2xl font-bold mb-6">Additional Product Details</h2>
                                <ProductDetailsTable productDetails={productInsights.productDetails} />
                            </div>
                        </div>

                        <div className="w-full md:px-3 py-6 mt-16 text-default-foreground">
                            <AlternativeProducts alternatives={productInsights.alternatives} />
                        </div>

                        {/* ✅ Compare Button */}
                        <div className="w-full md:px-3 py-4 flex justify-center">
                            <Button
                                color="primary"
                                size="lg"
                                radius="full"
                                isLoading={isFetchingProducts}
                                className="w-full md:w-auto px-12 text-lg font-bold"
                                onPress={handleCompareClick}
                            >
                                {isFetchingProducts ? "Loading..." : "Compare with alt"}
                            </Button>
                        </div>

                        <div className="flex flex-col items-center w-full mt-6 md:p-3 text-default-foreground">
                            <h2 className="text-2xl font-bold mb-6">Research Sources</h2>
                            <SourcesCard sources={productInsights.sources} />
                        </div>

                        {userDetails && (
                            <div className="flex flex-col items-center w-full text-default-foreground">
                                <h2 className="text-2xl font-bold mb-6">PurePick AI Chat</h2>
                                <ProductChat
                                    productId={id}
                                    productInsights={productInsights}
                                    userDetails={userDetails}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default ProductInsightPage;