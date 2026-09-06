import { NextRequest, NextResponse } from "next/server";
import { getArticles, addArticle } from "@/services/articleApi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const articles = await getArticles({
      search,
      category,
      limit,
      offset,
    });

    return NextResponse.json({
      status: "success",
      data: articles,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch articles lookup",
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

    const newArticle = await addArticle({
      title: body.title,
      category: body.category || null,
      content: body.content || null,
    });

    return NextResponse.json(
      {
        status: "success",
        data: newArticle,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to add article",
      },
      { status: 500 }
    );
  }
}
