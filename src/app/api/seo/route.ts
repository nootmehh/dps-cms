import { NextRequest, NextResponse } from "next/server";
import { getSeoSettings, updateSeoSettings, getPageMetas } from "@/services/seoApi";

export async function GET() {
  try {
    const settings = await getSeoSettings();
    const pageMetas = await getPageMetas();

    return NextResponse.json({
      status: "success",
      data: {
        settings,
        pageMetas,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch SEO settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, site_title_default, meta_description_default, auto_generate_sitemap, ga_connected, ga_measurement_id } = body;

    const updated = await updateSeoSettings(
      {
        site_title_default,
        meta_description_default,
        auto_generate_sitemap,
        ga_connected,
        ga_measurement_id,
      },
      id
    );

    return NextResponse.json({
      status: "success",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to update SEO settings",
      },
      { status: 500 }
    );
  }
}
