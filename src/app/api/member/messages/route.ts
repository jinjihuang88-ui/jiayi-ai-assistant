import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 获取消息列表
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (caseId) {
      where.caseId = caseId;
      // 验证case所有权
      const caseItem = await prisma.case.findFirst({
        where: { id: caseId, userId: user.id }
      });
      if (!caseItem) {
        return NextResponse.json(
          { success: false, message: 'Case不存在' },
          { status: 404 }
        );
      }
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        case: {
          select: {
            id: true,
            type: true,
            status: true,
            rcic: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                profilePhoto: true,
                consultantType: true,
                organization: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });

    // 如果指定了caseId，获取该案件的顾问信息
    let consultant = null;
    if (caseId) {
      const caseItem = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          rcic: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              profilePhoto: true,
              consultantType: true,
              organization: true,
              isOnline: true,
              lastActiveAt: true,
            },
          },
        },
      });
      consultant = caseItem?.rcic || null;
    }

    // 获取已审核通过的顾问数量
    const onlineRcicCount = await prisma.rCIC.count({
      where: { approvalStatus: 'approved' },
    });

    return NextResponse.json({
      success: true,
      messages,
      consultant, // 返回顾问信息
      onlineRcicCount,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, message: '获取消息失败' },
      { status: 500 }
    );
  }
}

// 发送消息
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { caseId, content, attachments } = await request.json();

    // 验证消息内容（如果有附件，内容可以为空）
    if ((!content || !content.trim()) && !attachments) {
      return NextResponse.json(
        { success: false, message: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 验证case所有权
    const caseItem = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: user.id,
      },
    });

    if (!caseItem) {
      return NextResponse.json(
        { success: false, message: 'Case不存在' },
        { status: 404 }
      );
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        caseId,
        senderId: user.id,
        senderType: 'user',
        content: content?.trim() || '',
        attachments: attachments || null,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, message: '发送消息失败' },
      { status: 500 }
    );
  }
}