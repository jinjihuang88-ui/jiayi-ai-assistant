import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 获取用户的所有申请
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = { userId: user.id };
    if (status) where.status = status;
    if (type) where.type = type;

    const applications = await prisma.application.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true, documents: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      applications: applications.map(app => ({
        id: app.id,
        type: app.type,
        typeName: app.typeName,
        status: app.status,
        rcicName: app.rcicName,
        rcicComment: app.rcicComment,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        submittedAt: app.submittedAt,
        messageCount: app._count.messages,
        documentCount: app._count.documents,
        lastStatusChange: app.statusHistory[0] || null,
      })),
    });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { success: false, message: '获取申请列表失败' },
      { status: 500 }
    );
  }
}

// 创建新申请
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { type, typeName, formData } = await request.json();

    if (!type || !typeName) {
      return NextResponse.json(
        { success: false, message: '缺少申请类型' },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: user.id,
        type,
        typeName,
        formData: JSON.stringify(formData || {}),
        statusHistory: {
          create: {
            toStatus: 'draft',
            changedBy: 'user',
            comment: '创建申请',
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        type: application.type,
        typeName: application.typeName,
        status: application.status,
      },
    });
  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { success: false, message: '创建申请失败' },
      { status: 500 }
    );
  }
}
