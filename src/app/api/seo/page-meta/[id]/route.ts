import { NextRequest, NextResponse } from "next/server";
import { updatePageMeta } from "@/services/seoApi";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    const updated = await updatePageMeta(id, {
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      keywords: body.keywords,
    });

    return NextResponse.json({
      status: "success",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to update page meta",
      },
      { status: 500 }
    );
  }
}
