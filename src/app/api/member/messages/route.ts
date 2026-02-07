import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCaseFollowerEmail } from '@/lib/case-follower';
import { sendCaseFollowerFileNotification } from '@/lib/email';

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
    // 同时支持 caseId 和 applicationId 参数
    const caseId = searchParams.get('caseId') || searchParams.get('applicationId');
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

    // 获取顾问信息、跟进人、持牌顾问审核状态（会员端展示：持牌顾问张三、顾问团队李四、持牌顾问已审核）
    let consultant = null;
    let assignedTeamMemberName: string | null = null;
    let rcicReviewedAt: string | null = null;
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
      if (caseItem) {
        rcicReviewedAt = caseItem.rcicReviewedAt?.toISOString() ?? null;
        if (caseItem.assignedTeamMemberId) {
          const assigned = await prisma.rCICTeamMember.findUnique({
            where: { id: caseItem.assignedTeamMemberId },
            select: { name: true },
          });
          assignedTeamMemberName = assigned?.name ?? null;
        }
      }
    } else {
      // 如果没有指定caseId，获取用户分配的顾问（用于咨询）
      console.log('[Messages API] No caseId, fetching user assigned consultant...'); // 调试日志
      const userWithRcic = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          assignedRcic: {
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
      console.log('[Messages API] User with RCIC:', userWithRcic?.id, userWithRcic?.assignedRcicId); // 调试日志
      consultant = userWithRcic?.assignedRcic || null;
      console.log('[Messages API] Consultant:', consultant?.id, consultant?.name); // 调试日志
    }

    // 获取已审核通过的顾问数量
    const onlineRcicCount = await prisma.rCIC.count({
      where: { approvalStatus: 'approved' },
    });

    return NextResponse.json({
      success: true,
      messages,
      consultant,
      assignedTeamMemberName: caseId ? assignedTeamMemberName : null,
      rcicReviewedAt: caseId ? rcicReviewedAt : null,
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
    console.log('[Send Message] Starting...');
    const user = await getCurrentUser();
    console.log('[Send Message] User:', user?.id, user?.email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[Send Message] Request body:', JSON.stringify(body));
    // 同时支持 caseId 和 applicationId 参数
    const caseId = body.caseId || body.applicationId;
    const { content, attachments } = body;
    console.log('[Send Message] Parsed - caseId:', caseId, 'content:', content?.substring(0, 50));

    // 验证消息内容（如果有附件，内容可以为空）
    if ((!content || !content.trim()) && !attachments) {
      return NextResponse.json(
        { success: false, message: '消息内容不能为空' },
        { status: 400 }
      );
    }

    let actualCaseId = caseId;

    // 如果没有指定caseId，检查用户是否有分配的顾问
    if (!actualCaseId) {
      console.log('[Send Message] No caseId provided, checking assigned RCIC...');
      const userWithRcic = await prisma.user.findUnique({
        where: { id: user.id },
        select: { assignedRcicId: true },
      });

      console.log('[Send Message] User RCIC assignment:', userWithRcic?.assignedRcicId);
      if (!userWithRcic?.assignedRcicId) {
        console.log('[Send Message] No assigned RCIC found');
        return NextResponse.json(
          { success: false, message: '请先选择顾问' },
          { status: 400 }
        );
      }

      // 自动创建一个咨询案件
      console.log('[Send Message] Creating consultation case...');
      const consultationCase = await prisma.case.create({
        data: {
          userId: user.id,
          rcicId: userWithRcic.assignedRcicId,
          type: 'consultation', // 咨询类型
          title: '咨询会话', // 默认标题
          status: 'pending',
        },
      });
      actualCaseId = consultationCase.id;
      console.log('[Send Message] Created case:', actualCaseId);
    } else {
      console.log('[Send Message] Using existing caseId:', caseId);
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
    }

    // 创建消息
    console.log('[Send Message] Creating message with caseId:', actualCaseId);
    const message = await prisma.message.create({
      data: {
        caseId: actualCaseId,
        senderId: user.id,
        senderType: 'user',
        content: content?.trim() || '',
        attachments: attachments || null,
      },
    });

    // 会员发送文件/图片时，发邮件通知该案件跟进人
    const hasAttachments = (() => {
      if (!attachments) return false;
      try {
        const arr = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
        return Array.isArray(arr) && arr.length > 0;
      } catch {
        return false;
      }
    })();
    if (hasAttachments) {
      getCaseFollowerEmail(prisma, actualCaseId)
        .then((follower) => {
          if (follower?.email) {
            sendCaseFollowerFileNotification(follower.email, { caseTitle: follower.caseTitle }).catch((e) =>
              console.error('[Send Message] Notify follower file:', e)
            );
          }
        })
        .catch((e) => console.error('[Send Message] getCaseFollowerEmail:', e));
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('[Send Message] Error:', error);
    console.error('[Send Message] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[Send Message] Error message:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        success: false, 
        message: '发送消息失败',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}