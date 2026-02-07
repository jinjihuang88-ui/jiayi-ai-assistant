import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 验证团队成员登录
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("team_member_session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "未登录" },
        { status: 401 }
      );
    }

    // 查找session（使用token字段）
    const session = await prisma.rCICTeamMemberSession.findUnique({
      where: { token: sessionToken },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: "会话已过期" },
        { status: 401 }
      );
    }

    // 获取团队成员信息
    const member = await prisma.rCICTeamMember.findUnique({
      where: { id: session.memberId },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "团队成员不存在" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    const contactId = searchParams.get("contactId");

    let caseIds: string[] = [];

    if (contactId && contactId.startsWith("member_")) {
      const userId = contactId.slice(7);
      const casesForMember = await prisma.case.findMany({
        where: { assignedTeamMemberId: member.id, userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      caseIds = casesForMember.map((c) => c.id);
      if (caseIds.length === 0) {
        return NextResponse.json({
          success: true,
          messages: [],
          primaryCaseId: null,
        });
      }
    } else if (caseId) {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
      });
      if (!caseData || caseData.rcicId !== member.rcicId || caseData.assignedTeamMemberId !== member.id) {
        return NextResponse.json(
          { success: false, message: "无权访问该案件" },
          { status: 403 }
        );
      }
      caseIds = [caseId];
    } else {
      return NextResponse.json(
        { success: false, message: "请提供 caseId 或 contactId" },
        { status: 400 }
      );
    }

    const where = caseIds.length === 1
      ? { caseId: caseIds[0] }
      : { caseId: { in: caseIds } };

    const rawMessages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    const messages = rawMessages.map((msg) => {
      let attachments: { url?: string; name?: string; fileName?: string }[] = [];
      if (msg.attachments) {
        try {
          const parsed = JSON.parse(msg.attachments);
          attachments = Array.isArray(parsed)
            ? parsed.map((f: any) => ({ url: f.url, name: f.name, fileName: f.name ?? f.fileName }))
            : [];
        } catch (_) {}
      }
      return {
        ...msg,
        attachments,
      };
    });

    const primaryCaseId = caseIds[0] ?? null;

    return NextResponse.json({
      success: true,
      messages,
      primaryCaseId,
    });
  } catch (error) {
    console.error("[Team Messages GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "获取消息失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证团队成员登录
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("team_member_session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "未登录" },
        { status: 401 }
      );
    }

    // 查找session（使用token字段）
    const session = await prisma.rCICTeamMemberSession.findUnique({
      where: { token: sessionToken },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: "会话已过期" },
        { status: 401 }
      );
    }

    // 获取团队成员信息
    const member = await prisma.rCICTeamMember.findUnique({
      where: { id: session.memberId },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "团队成员不存在" },
        { status: 404 }
      );
    }

    const body = await request.json();
    let caseId = body.caseId;
    const contactId = body.contactId;
    const { content, fileUrl, fileName, fileType } = body;

    if (!content && !fileUrl) {
      return NextResponse.json(
        { success: false, message: "消息内容不能为空" },
        { status: 400 }
      );
    }

    if (contactId && contactId.startsWith("member_") && !caseId) {
      const userId = contactId.slice(7);
      const casesForMember = await prisma.case.findMany({
        where: { assignedTeamMemberId: member.id, userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, type: true },
      });
      const consultation = casesForMember.find((c) => c.type === "consultation");
      caseId = consultation?.id ?? casesForMember[0]?.id ?? null;
    }

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData || caseData.rcicId !== member.rcicId || caseData.assignedTeamMemberId !== member.id) {
      return NextResponse.json(
        { success: false, message: "无权访问该案件" },
        { status: 403 }
      );
    }

    let attachments = null;
    if (fileUrl) {
      attachments = JSON.stringify([
        {
          url: fileUrl,
          name: fileName || "未命名文件",
          type: fileType || "file",
        },
      ]);
    }

    const message = await prisma.message.create({
      data: {
        caseId: caseData.id,
        senderId: member.rcicId,
        senderType: "rcic",
        content: content || "发送了文件",
        attachments,
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("[Team Messages POST] Error:", error);
    return NextResponse.json(
      { success: false, message: "发送消息失败" },
      { status: 500 }
    );
  }
}
