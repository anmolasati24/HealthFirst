import { ProductInsights } from "@/types/product.types";

export const canSendMsg = async (
    productId: string,
    productInsights: ProductInsights,
    userId: string
) => {
    try {
        if (!userId || !productId) return false;

        // ✅ userIdCopy is object { _id, firstName, email }
        const productUserId =
            (typeof productInsights.userIdCopy === 'object'
                ? productInsights.userIdCopy?._id?.toString()
                : productInsights.userIdCopy?.toString()) ||
            productInsights.userId?.toString();

        if (!productUserId) return false;

        if (userId !== productUserId) {
            console.log("❌ User ID mismatch:", userId, "vs", productUserId);
            return false;
        }

        const response = await fetch("/api/chat", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                productId: productId,
                userId: userId,
            },
        });

        if (!response.ok) {
            console.log("❌ Chat API error:", response.status);
            return false;
        }

        const data = await response.json();

        if (data.error) {
            console.log("❌ Chat error:", data.error);
            return false;
        }

        return true;

    } catch (error) {
        console.error("❌ canSendMsg error:", error);
        return false;
    }
};