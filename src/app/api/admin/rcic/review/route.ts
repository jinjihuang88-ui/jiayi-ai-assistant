import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token");

    if (!adminToken || adminToken.value !== "authenticated") {
      return NextResponse.json(
        {
          success: false,
          message: "未授权访问",
        },
        { status: 401 }
      );
    }

    const { rcicId, action, notes } = await request.json();

    if (!rcicId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少必要参数",
        },
        { status: 400 }
      );
    }

    if (action === "reject" && !notes?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "拒绝时必须填写原因",
        },
        { status: 400 }
      );
    }

    // 获取顾问信息
    const consultant = await prisma.rCIC.findUnique({
      where: { id: rcicId },
    });

    if (!consultant) {
      return NextResponse.json(
        {
          success: false,
          message: "顾问不存在",
        },
        { status: 404 }
      );
    }

    // 更新审核状态。流程：先验证邮箱 → 再审核 → 审核通过才能登录（此处不修改 emailVerified）
    const newStatus = action === "approve" ? "approved" : "rejected";
    await prisma.rCIC.update({
      where: { id: rcicId },
      data: {
        approvalStatus: newStatus,
        approvalNotes: notes || null,
        approvedAt: action === "approve" ? new Date() : null,
      },
    });

    // 发送邮件通知
    try {
      const emailSubject =
        action === "approve"
          ? "🎉 您的RCIC顾问申请已通过审核"
          : "您的RCIC顾问申请未通过审核";

      const emailContent =
        action === "approve"
          ? `
            <h2>恭喜您！</h2>
            <p>您的RCIC顾问申请已通过审核。</p>
            <p>现在您可以登录系统开始使用顾问功能了。</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.jiayi.co"}/rcic/login" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">立即登录</a></p>
            ${notes ? `<p style="margin-top: 20px; padding: 12px; background-color: #F3F4F6; border-radius: 6px;"><strong>审核备注：</strong>${notes}</p>` : ""}
          `
          : `
            <h2>很抱歉</h2>
            <p>您的RCIC顾问申请未通过审核。</p>
            <p style="margin-top: 20px; padding: 12px; background-color: #FEE2E2; border-radius: 6px;"><strong>拒绝原因：</strong>${notes}</p>
            <p style="margin-top: 20px;">您可以修改资料后重新提交申请。</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.jiayi.co"}/rcic/register" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">重新申请</a></p>
          `;

      await resend.emails.send({
        from: `${process.env.EMAIL_FROM_NAME || "佳易移民"} <${process.env.EMAIL_FROM}>`,
        to: consultant.email,
        subject: emailSubject,
        html: emailContent,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // 邮件发送失败不影响审核结果
    }

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "审核通过" : "已拒绝申请",
    });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "审核失败",
      },
      { status: 500 }
    );
  }
}
