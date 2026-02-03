import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // ID格式: messageId-fileName
    const messageId = id.split("-")[0];

    // 查找消息
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        case: true,
      },
    });

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "文档不存在",
        },
        { status: 404 }
      );
    }

    // 检查权限
    if (message.case.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "无权删除此文档",
        },
        { status: 403 }
      );
    }

    // 删除消息（级联删除附件）
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "删除失败",
      },
      { status: 500 }
    );
  }
}
