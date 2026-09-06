import { NextRequest, NextResponse } from "next/server";
import { getServices, addService } from "@/services/serviceApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const productId = searchParams.get("productId") || undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const services = await getServices({
      search,
      category,
      productId,
      limit,
      offset,
    });

    return NextResponse.json({
      status: "success",
      data: services,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch services lookup",
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

    const newService = await addService({
      title: body.title,
      category: body.category || null,
      keunggulan: body.keunggulan || null,
      faq: body.faq || null,
      product_id: body.product_id || null,
      service_image_url: body.service_image_url || null,
    });

    return NextResponse.json(
      {
        status: "success",
        data: newService,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to add service",
      },
      { status: 500 }
    );
  }
}
