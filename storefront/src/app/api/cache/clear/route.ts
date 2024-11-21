import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Clear all relevant cache tags
    revalidateTag("regions")
    revalidateTag("cart")
    revalidateTag("products")

    // Force region map cache to update by setting the update time to past
    const regionMapCache = {
      regionMap: new Map(),
      regionMapUpdated: 0,
    }

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    )
  }
}
