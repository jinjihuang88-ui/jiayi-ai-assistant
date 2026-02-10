import { NextRequest, NextResponse } from "next/server";
import { getCurrentRCIC } from "@/lib/rcic-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 获取用户文档列表（顾问端）
export async function GET(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();

    if (!rcic) {
      return NextResponse.json(
        {
          success: false,
          message: "未登录",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const caseId = searchParams.get("caseId");

    if (!userId && !caseId) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少用户ID或案件ID",
        },
        { status: 400 }
      );
    }

    // 查询条件
    const where: any = {};
    
    if (caseId) {
      // 验证案件归属
      const caseItem = await prisma.case.findFirst({
        where: { id: caseId, rcicId: rcic.id },
      });
      
      if (!caseItem) {
        return NextResponse.json(
          {
            success: false,
            message: "案件不存在或无权访问",
          },
          { status: 403 }
        );
      }
      
      where.caseId = caseId;
    } else if (userId) {
      // 查询该用户的所有案件
      const cases = await prisma.case.findMany({
        where: { userId, rcicId: rcic.id },
        select: { id: true },
      });
      
      if (cases.length === 0) {
        return NextResponse.json({
          success: true,
          documents: [],
        });
      }
      
      where.caseId = {
        in: cases.map(c => c.id),
      };
    }

    // 查询消息中的附件
    const messages = await prisma.message.findMany({
      where: {
        ...where,
        attachments: {
          not: null,
        },
      },
      include: {
        case: {
          select: {
            id: true,
            type: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 提取所有附件
    const documents: any[] = [];
    messages.forEach((message) => {
      if (message.attachments) {
        try {
          const attachments = JSON.parse(message.attachments);
          attachments.forEach((attachment: any) => {
            documents.push({
              id: `${message.id}-${attachment.name}`,
              name: attachment.name,
              url: attachment.url,
              type: attachment.type || "application/octet-stream",
              size: attachment.size || 0,
              createdAt: message.createdAt,
              caseId: message.case.id,
              caseType: message.case.type,
              caseTitle: message.case.title,
              user: message.case.user,
            });
          });
        } catch (e) {
          console.error("Failed to parse attachments:", e);
        }
      }
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get RCIC documents error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取文档列表失败",
      },
      { status: 500 }
    );
  }
}
