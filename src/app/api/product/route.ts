import { NextRequest, NextResponse } from "next/server";
import { getProducts, addProduct } from "@/services/productApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const products = await getProducts({
      search,
      category,
      limit,
      offset,
    });

    return NextResponse.json({
      status: "success",
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch products lookup",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        {
          status: "error",
          message: "Field 'title' is required",
        },
        { status: 400 }
      );
    }

    const newProduct = await addProduct({
      title: body.title,
      category: body.category || null,
      description: body.description || null,
      detail_product: body.detail_product || null,
      suitable_for: body.suitable_for || null,
      kelebihan: body.kelebihan || null,
      kekurangan: body.kekurangan || null,
      product_image_url: body.product_image_url || null,
      highlight_img_url: body.highlight_img_url || null,
    });

    return NextResponse.json(
      {
        status: "success",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to add product",
      },
      { status: 500 }
    );
  }
}
