import { NextRequest, NextResponse } from "next/server";
import { getProductById, editProduct, deleteProduct } from "@/services/productApi";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          status: "error",
          message: `Product with ID '${id}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: product,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch product detail",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    const updatedProduct = await editProduct(id, {
      title: body.title,
      category: body.category,
      description: body.description,
      detail_product: body.detail_product,
      suitable_for: body.suitable_for,
      kelebihan: body.kelebihan,
      kekurangan: body.kekurangan,
      product_image_url: body.product_image_url,
      highlight_img_url: body.highlight_img_url,
    });

    return NextResponse.json({
      status: "success",
      data: updatedProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to edit product",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(request, props);
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    await deleteProduct(id);

    return NextResponse.json({
      status: "success",
      message: `Product ID '${id}' deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
