import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let targetUrl = body?.url?.trim();

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, message: "URL is required" },
        { status: 400 }
      );
    }

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    // Validate URL syntax
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid URL format" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Perform request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    let res: Response;
    try {
      res = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; FusionTools-Header-Auditor/1.0; +https://fusiontools.in)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        redirect: "follow",
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        {
          success: false,
          message:
            fetchErr.name === "AbortError"
              ? "Request timed out after 9 seconds. The destination server did not respond."
              : `Failed to connect to ${targetUrl}: ${fetchErr.message || "Network error"}`,
        },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const responseTimeMs = Date.now() - startTime;

    // Extract headers into a clean Record
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return NextResponse.json({
      success: true,
      url: targetUrl,
      finalUrl: res.url,
      statusCode: res.status,
      statusText: res.statusText || (res.ok ? "OK" : "Error"),
      responseTimeMs,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error analyzing headers",
      },
      { status: 500 }
    );
  }
}
