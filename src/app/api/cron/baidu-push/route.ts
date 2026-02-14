import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://www.jiayi.co";

/** 与 sitemap 一致的路径列表，用于推送到百度 */
const PATHS = [
  "/",
  "/about",
  "/services",
  "/applications",
  "/applications/study-permit",
  "/applications/study-permit-ircc",
  "/applications/work-permit",
  "/applications/visitor-visa",
  "/applications/express-entry",
  "/applications/provincial-nominee",
  "/assessment",
  "/chat",
  "/consultant-standards",
  "/privacy",
  "/terms",
  "/report",
  "/auth/login",
  "/auth/register",
  "/auth/verify",
  "/auth/resend-verification",
  "/auth/rcic/register",
  "/member/consultants",
  "/member/applications",
  "/rcic/login",
  "/rcic/register",
];

/**
 * 百度链接提交（推送收录）。供 Vercel Cron 或手动调用。
 * 鉴权：Authorization: Bearer <CRON_SECRET> 或 query ?secret=<CRON_SECRET>。
 * 需配置 BAIDU_PUSH_TOKEN（百度搜索资源平台 -> 普通收录 -> API 提交）。
 *
 * 推送反馈（查看返回 JSON）：
 * - 状态码 200：feedback.success=成功条数, feedback.remain=当日剩余配额, feedback.not_same_site/not_valid=未处理或非法 URL。
 * - 状态码 4xx/5xx：feedback.error=错误码, feedback.message=错误描述（如 401 token is not valid、400 site error 等）。
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      const querySecret = request.nextUrl.searchParams.get("secret");
      if (bearer !== cronSecret && querySecret !== cronSecret) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
    }

    const siteDomain = process.env.BAIDU_PUSH_SITE || "www.jiayi.co";
    const siteDomainClean = siteDomain.replace(/^https?:\/\//, "");
    const token = process.env.BAIDU_PUSH_TOKEN;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "BAIDU_PUSH_TOKEN not configured" },
        { status: 500 }
      );
    }

    const base = siteDomain.startsWith("http") ? siteDomain : `https://${siteDomainClean}`;
    const urls = PATHS.map((p) => (p === "/" ? base : `${base}${p}`));
    const body = urls.join("\n");
    const pushUrl = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(siteDomainClean)}&token=${encodeURIComponent(token)}`;

    const res = await fetch(pushUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    });

    /** 百度 API 返回：成功 200 为 success/remain/not_same_site/not_valid；失败 4xx/5xx 为 error + message */
    const data = (await res.json()) as
      | { success: number; remain: number; not_same_site?: string[]; not_valid?: string[] }
      | { error: number; message: string };

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "message" in data ? data.message : res.statusText,
          feedback: {
            statusCode: res.status,
            error: "error" in data ? data.error : res.status,
            message: "message" in data ? data.message : res.statusText,
          },
          baidu: data,
        },
        { status: res.status }
      );
    }

    const ok = data as { success: number; remain: number; not_same_site?: string[]; not_valid?: string[] };
    return NextResponse.json({
      success: true,
      submitted: urls.length,
      feedback: {
        statusCode: 200,
        success: ok.success,
        remain: ok.remain,
        not_same_site: ok.not_same_site ?? [],
        not_valid: ok.not_valid ?? [],
      },
      baidu: data,
    });
  } catch (e) {
    console.error("[cron/baidu-push]", e);
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
