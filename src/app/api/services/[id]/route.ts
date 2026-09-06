import { NextRequest, NextResponse } from "next/server";
import { getServiceById, editService, deleteService } from "@/services/serviceApi";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const service = await getServiceById(id);

    if (!service) {
      return NextResponse.json(
        {
          status: "error",
          message: `Service with ID '${id}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: service,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch service detail",
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

    const updatedService = await editService(id, {
      title: body.title,
      category: body.category,
      keunggulan: body.keunggulan,
      faq: body.faq,
      product_id: body.product_id,
      service_image_url: body.service_image_url,
    });

    return NextResponse.json({
      status: "success",
      data: updatedService,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to edit service",
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
    await deleteService(id);

    return NextResponse.json({
      status: "success",
      message: `Service ID '${id}' deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to delete service",
      },
      { status: 500 }
    );
  }
}
