import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentRCIC } from '@/lib/rcic-auth';

// 获取消息列表（顾问端）：支持 caseId 或 contactId（member_<userId>）
export async function GET(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId') || searchParams.get('applicationId');
    const contactId = searchParams.get('contactId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let caseIds: string[] = [];

    if (contactId && contactId.startsWith('member_')) {
      const userId = contactId.slice(7);
      const casesForMember = await prisma.case.findMany({
        where: { rcicId: rcic.id, userId },
        orderBy: { updatedAt: 'desc' },
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
      const caseItem = await prisma.case.findFirst({
        where: { id: caseId, rcicId: rcic.id },
      });
      if (!caseItem) {
        return NextResponse.json(
          { success: false, message: 'Case不存在' },
          { status: 404 }
        );
      }
      caseIds = [caseId];
    } else {
      return NextResponse.json(
        { success: false, message: '请提供 caseId 或 contactId' },
        { status: 400 }
      );
    }

    const where = caseIds.length === 1
      ? { caseId: caseIds[0] }
      : { caseId: { in: caseIds } };

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
            userId: true,
          },
        },
      },
    });

    const messagesWithAttachments = messages.map(msg => {
      let attachments: any[] = [];
      if (msg.attachments) {
        try {
          const parsed = JSON.parse(msg.attachments);
          attachments = (Array.isArray(parsed) ? parsed : []).map((file: any, idx: number) => ({
            id: `${msg.id}-${idx}`,
            fileName: file.name,
            fileType: file.type?.startsWith('image/') ? 'image' : 'document',
            fileSize: file.size || 0,
            mimeType: file.type || 'application/octet-stream',
            url: file.url,
          }));
        } catch (e) {
          console.error('Failed to parse attachments:', e);
        }
      }
      return {
        ...msg,
        attachments,
        messageType: 'text',
        senderName: null,
        application: null,
      };
    });

    const primaryCaseId = caseIds[0] ?? null;

    return NextResponse.json({
      success: true,
      messages: messagesWithAttachments.reverse(),
      primaryCaseId,
    });
  } catch (error) {
    console.error('Get RCIC messages error:', error);
    return NextResponse.json(
      { success: false, message: '获取消息失败' },
      { status: 500 }
    );
  }
}

// 发送消息（顾问端）：支持 caseId 或 contactId（member_<userId>），可选 attachments
export async function POST(request: NextRequest) {
  try {
    const rcic = await getCurrentRCIC();
    if (!rcic) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let caseId = body.caseId || body.applicationId;
    const contactId = body.contactId;
    const content = body.content?.trim() ?? '';
    const attachments = body.attachments;

    if (!content && !attachments) {
      return NextResponse.json(
        { success: false, message: '消息内容不能为空' },
        { status: 400 }
      );
    }

    if (contactId && contactId.startsWith('member_') && !caseId) {
      const userId = contactId.slice(7);
      const casesForMember = await prisma.case.findMany({
        where: { rcicId: rcic.id, userId },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, type: true },
      });
      const consultation = casesForMember.find((c) => c.type === 'consultation');
      caseId = consultation?.id ?? casesForMember[0]?.id ?? null;
    }

    const caseItem = await prisma.case.findFirst({
      where: { id: caseId, rcicId: rcic.id },
    });

    if (!caseItem) {
      return NextResponse.json(
        { success: false, message: 'Case不存在' },
        { status: 404 }
      );
    }

    let attachmentsStr: string | null = null;
    if (attachments && Array.isArray(attachments)) {
      attachmentsStr = JSON.stringify(
        attachments.map((a: any) => ({
          name: a.fileName ?? a.name,
          url: a.url,
          type: a.mimeType ?? a.fileType ?? 'file',
          size: a.fileSize ?? 0,
        }))
      );
    }

    const message = await prisma.message.create({
      data: {
        caseId: caseItem.id,
        senderId: rcic.id,
        senderType: 'rcic',
        content: content || '发送了文件',
        attachments: attachmentsStr,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send RCIC message error:', error);
    return NextResponse.json(
      { success: false, message: '发送消息失败' },
      { status: 500 }
    );
  }
}