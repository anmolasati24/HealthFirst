import { MAX_MESSAGES } from '@/data/constants';
import connectDB from '@/lib/db-connect';
import ProductInsight from '@/models/product-insight';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const productId = req.headers.get('productId');
        const userId = req.headers.get('userId');

        if (!productId || !userId) {
            return NextResponse.json(
                { error: 'Product ID and User ID are required' },
                { status: 400 }
            );
        }

        await connectDB();
        const product = await ProductInsight.findById(productId);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // ✅ userIdCopy is ObjectId directly, not object with _id
        if (product.userIdCopy?._id?.toString() !== userId &&
            product.userId?.toString() !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (product.chat.messageCount >= MAX_MESSAGES) {
            return NextResponse.json(
                { error: 'Chat limit reached' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("❌ Chat GET error:", error);
        return NextResponse.json(
            { error: 'Error checking chat limit' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { productId, userMessage, aiMessage } = await req.json();

        // ✅ Validate required fields
        if (!productId) {
            return NextResponse.json(
                { error: "Product ID is required" },
                { status: 400 }
            );
        }

        if (!userMessage?.content || !aiMessage?.content) {
            return NextResponse.json(
                { error: "Message content is required" },
                { status: 400 }
            );
        }

        if (userMessage.content.length > 2000) {
            return NextResponse.json(
                { error: "Message too long" },
                { status: 400 }
            );
        }

        await connectDB();

        const product = await ProductInsight.findById(productId);
        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // ✅ Check limit BEFORE saving
        if (product.chat.messageCount >= MAX_MESSAGES) {
            return NextResponse.json(
                { error: "Message limit reached" },
                { status: 400 }
            );
        }

        const messages = [
            {
                id: userMessage.id,
                role: 'user',
                content: userMessage.content.trim(),
                timestamp: new Date(),
            },
            {
                id: aiMessage.id,
                role: 'assistant',
                content: aiMessage.content.trim(),
                timestamp: new Date(),
            },
        ];

        await ProductInsight.findByIdAndUpdate(
            productId,
            {
                $push: {
                    'chat.messages': {
                        $each: messages,
                    },
                },
                $inc: { 'chat.messageCount': 1 },
            },
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("❌ Chat POST error:", error);
        return NextResponse.json({
            error: "Failed to save messages",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}