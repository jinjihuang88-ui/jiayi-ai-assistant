import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCaseFollowerWithStatus } from '@/lib/case-follower';
import { sendCaseFollowerFileNotification } from '@/lib/email';
import { sendCaseFollowerOfflineNotification } from '@/lib/wechat';
import { isRcicEffectivelyOnline } from '@/lib/rcic-online';

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
    const caseId = searchParams.get('caseId') || searchParams.get('applicationId');
    const contactId = searchParams.get('contactId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let caseIds: string[] = [];
    if (contactId) {
      const [prefix, id] = contactId.startsWith('team_')
        ? ['team', contactId.slice(5)]
        : contactId.startsWith('rcic_')
          ? ['rcic', contactId.slice(5)]
          : [null, null];
      if (prefix && id) {
        const whereCase: { userId: string; rcicId?: string; assignedTeamMemberId?: string } = {
          userId: user.id,
        };
        if (prefix === 'rcic') whereCase.rcicId = id;
        else whereCase.assignedTeamMemberId = id;
        const casesForContact = await prisma.case.findMany({
          where: whereCase,
          select: { id: true },
        });
        caseIds = casesForContact.map((c) => c.id);
      }
      if (caseIds.length === 0 && prefix === 'rcic' && id) {
        // 已选顾问、尚未发过消息：创建 consultation case 并返回其 id，以便前端显示视频/语音按钮
        const consultationCase = await prisma.case.create({
          data: {
            userId: user.id,
            rcicId: id,
            type: 'consultation',
            title: '与顾问沟通',
            status: 'pending',
          },
        });
        caseIds = [consultationCase.id];
      }
      if (caseIds.length === 0) {
        let consultantForContact: unknown = null;
        if (prefix === 'rcic' && id) {
          const rcic = await prisma.rCIC.findUnique({
            where: { id },
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
          });
          consultantForContact = rcic;
        }
        return NextResponse.json({
          success: true,
          messages: [],
          consultant: consultantForContact,
          assignedTeamMemberName: null,
          rcicReviewedAt: null,
          primaryCaseId: null,
        });
      }
    } else if (caseId) {
      const caseItem = await prisma.case.findFirst({
        where: { id: caseId, userId: user.id },
      });
      if (!caseItem) {
        return NextResponse.json(
          { success: false, message: 'Case不存在' },
          { status: 404 }
        );
      }
      caseIds = [caseId];
    }

    const where: { caseId?: string | { in: string[] } } =
      caseIds.length === 1 ? { caseId: caseIds[0] } : { caseId: { in: caseIds } };

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

    let consultant: unknown = null;
    let assignedTeamMemberName: string | null = null;
    let rcicReviewedAt: string | null = null;
    const primaryCaseId = caseIds[0] ?? null;

    if (caseIds.length > 0) {
      const caseItem = await prisma.case.findUnique({
        where: { id: caseIds[0] },
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
    }

    if (!contactId && !caseId) {
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
      consultant = userWithRcic?.assignedRcic || null;
    }

    const onlineRcicCount = await prisma.rCIC.count({
      where: { approvalStatus: 'approved' },
    });

    // 返回给前端的顾问在线状态按“真实在线”（最近 5 分钟有活跃）计算
    if (consultant && typeof consultant === 'object' && 'isOnline' in consultant && 'lastActiveAt' in consultant) {
      const c = consultant as { isOnline: boolean; lastActiveAt: Date | null };
      consultant = { ...consultant, isOnline: isRcicEffectivelyOnline(c.isOnline, c.lastActiveAt) };
    }

    return NextResponse.json({
      success: true,
      messages,
      consultant,
      assignedTeamMemberName: caseIds.length > 0 ? assignedTeamMemberName : null,
      rcicReviewedAt: caseIds.length > 0 ? rcicReviewedAt : null,
      primaryCaseId,
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
    const caseId = body.caseId || body.applicationId;
    const contactId = body.contactId;
    const { content, attachments } = body;

    if ((!content || !content.trim()) && !attachments) {
      return NextResponse.json(
        { success: false, message: '消息内容不能为空' },
        { status: 400 }
      );
    }

    let actualCaseId: string | null = caseId;

    if (contactId && !actualCaseId) {
      const [prefix, id] = contactId.startsWith('team_')
        ? ['team', contactId.slice(5)]
        : contactId.startsWith('rcic_')
          ? ['rcic', contactId.slice(5)]
          : [null, null];
      if (prefix && id) {
        const whereCase: { userId: string; rcicId?: string; assignedTeamMemberId?: string } = {
          userId: user.id,
        };
        if (prefix === 'rcic') whereCase.rcicId = id;
        else whereCase.assignedTeamMemberId = id;
        const casesForContact = await prisma.case.findMany({
          where: whereCase,
          orderBy: { updatedAt: 'desc' },
          select: { id: true, type: true },
        });
        const consultation = casesForContact.find((c) => c.type === 'consultation');
        actualCaseId = consultation?.id ?? casesForContact[0]?.id ?? null;
        if (!actualCaseId && prefix === 'rcic') {
          const consultationCase = await prisma.case.create({
            data: {
              userId: user.id,
              rcicId: id,
              type: 'consultation',
              title: '与顾问沟通',
              status: 'pending',
            },
          });
          actualCaseId = consultationCase.id;
        }
      }
    }

    if (!actualCaseId) {
      const userWithRcic = await prisma.user.findUnique({
        where: { id: user.id },
        select: { assignedRcicId: true },
      });
      if (!userWithRcic?.assignedRcicId) {
        return NextResponse.json(
          { success: false, message: '请先选择顾问' },
          { status: 400 }
        );
      }
      const consultationCase = await prisma.case.create({
        data: {
          userId: user.id,
          rcicId: userWithRcic.assignedRcicId,
          type: 'consultation',
          title: '与顾问沟通',
          status: 'pending',
        },
      });
      actualCaseId = consultationCase.id;
    } else if (actualCaseId) {
      const caseItem = await prisma.case.findFirst({
        where: { id: actualCaseId, userId: user.id },
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

    // 会员发送文件/图片时，发邮件通知该案件跟进人；若跟进人不在线则同时发企业微信
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
      getCaseFollowerWithStatus(prisma, actualCaseId)
        .then(async (follower) => {
          if (process.env.NODE_ENV === 'production') {
            console.log('[Send Message] follower (file):', follower ? { email: follower.email, isOnline: follower.isOnline, role: follower.role } : null);
          }
          if (follower?.email) {
            await sendCaseFollowerFileNotification(follower.email, { caseTitle: follower.caseTitle }).catch((e) =>
              console.error('[Send Message] Notify follower file:', e)
            );
            if (!follower.isOnline) {
              const result = await sendCaseFollowerOfflineNotification({
                caseTitle: follower.caseTitle,
                followerName: follower.name,
                type: 'file',
              });
              if (process.env.NODE_ENV === 'production') {
                console.log('[Send Message] WeChat offline notify (file) result:', result.success ? 'ok' : result.error);
              }
            }
          }
        })
        .catch((e) => console.error('[Send Message] getCaseFollowerWithStatus:', e));
    } else {
      // 会员发送纯文字消息且跟进人不在线时，发企业微信通知（不新增邮件，保持原有逻辑）
      getCaseFollowerWithStatus(prisma, actualCaseId)
        .then(async (follower) => {
          if (process.env.NODE_ENV === 'production') {
            console.log('[Send Message] follower:', follower ? { email: follower.email, isOnline: follower.isOnline, role: follower.role } : null);
          }
          if (follower && !follower.isOnline) {
            const result = await sendCaseFollowerOfflineNotification({
              caseTitle: follower.caseTitle,
              followerName: follower.name,
              type: 'message',
            });
            if (process.env.NODE_ENV === 'production') {
              console.log('[Send Message] WeChat offline notify result:', result.success ? 'ok' : result.error);
            }
          }
        })
        .catch((e) => console.error('[Send Message] getCaseFollowerWithStatus:', e));
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