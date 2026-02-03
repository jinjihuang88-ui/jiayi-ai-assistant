import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 获取用户文档列表
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "未登录",
        },
        { status: 401 }
      );
    }

    // 从用户的案件中获取所有文档
    const cases = await prisma.case.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          where: {
            attachments: {
              not: null,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // 提取所有附件
    const documents: any[] = [];
    cases.forEach((caseItem) => {
      caseItem.messages.forEach((message) => {
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
                caseId: caseItem.id,
                caseType: caseItem.type,
              });
            });
          } catch (e) {
            console.error("Failed to parse attachments:", e);
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取文档列表失败",
      },
      { status: 500 }
    );
  }
}

// 上传文档（创建消息附件）
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "未登录",
        },
        { status: 401 }
      );
    }

    const { name, url, type, size, caseId } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        {
          success: false,
          message: "缺少必要参数",
        },
        { status: 400 }
      );
    }

    // 如果没有指定案件，创建一个通用文档案件
    let targetCaseId = caseId;
    if (!targetCaseId) {
      // 查找或创建一个"文档存储"案件
      let documentCase = await prisma.case.findFirst({
        where: {
          userId: user.id,
          type: "document-storage",
        },
      });

      if (!documentCase) {
        documentCase = await prisma.case.create({
          data: {
            userId: user.id,
            type: "document-storage",
            title: "文档存储",
            description: "用户上传的文档",
            status: "pending",
          },
        });
      }

      targetCaseId = documentCase.id;
    }

    // 创建消息记录，附件存储在attachments字段
    const message = await prisma.message.create({
      data: {
        caseId: targetCaseId,
        senderId: user.id,
        senderType: "user",
        content: `上传了文档: ${name}`,
        attachments: JSON.stringify([
          {
            name,
            url,
            type,
            size,
          },
        ]),
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: `${message.id}-${name}`,
        name,
        url,
        type,
        size,
        createdAt: message.createdAt,
      },
      message: "文档上传成功",
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "上传失败",
      },
      { status: 500 }
    );
  }
}
