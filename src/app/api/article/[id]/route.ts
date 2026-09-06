import { NextRequest, NextResponse } from "next/server";
import { getArticleById, editArticle, deleteArticle } from "@/services/articleApi";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const article = await getArticleById(id);

    if (!article) {
      return NextResponse.json(
        {
          status: "error",
          message: `Article with ID '${id}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: article,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch article detail",
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

    const updatedArticle = await editArticle(id, {
      title: body.title,
      category: body.category,
      content: body.content,
    });

    return NextResponse.json({
      status: "success",
      data: updatedArticle,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to edit article",
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
    await deleteArticle(id);

    return NextResponse.json({
      status: "success",
      message: `Article ID '${id}' deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to delete article",
      },
      { status: 500 }
    );
  }
}
