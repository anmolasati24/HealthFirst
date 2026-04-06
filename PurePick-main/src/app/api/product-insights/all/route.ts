// app/api/product-insights/all/route.ts

import connectDB from "@/lib/db-connect";
import ProductInsight from "@/models/product-insight";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required." }, { status: 400 });
        }

        await connectDB();

        const productInsights = await ProductInsight.find({ userId })
            .select("_id productDetails overall eco_rating confidence age_groups user")
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({ productInsights }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}