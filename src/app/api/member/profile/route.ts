import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 获取个人资料
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const savedInfo = await prisma.savedInfo.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile,
      savedInfo: savedInfo ? {
        personalInfo: savedInfo.personalInfo ? JSON.parse(savedInfo.personalInfo) : null,
        contactInfo: savedInfo.contactInfo ? JSON.parse(savedInfo.contactInfo) : null,
        educationInfo: savedInfo.educationInfo ? JSON.parse(savedInfo.educationInfo) : null,
        workInfo: savedInfo.workInfo ? JSON.parse(savedInfo.workInfo) : null,
        familyInfo: savedInfo.familyInfo ? JSON.parse(savedInfo.familyInfo) : null,
      } : null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: '获取资料失败' },
      { status: 500 }
    );
  }
}

// 更新个人资料
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const { name, phone, profile, savedInfo } = await request.json();

    // 更新用户基本信息
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone,
      },
    });

    // 更新详细资料
    if (profile) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...profile,
        },
        update: profile,
      });
    }

    // 更新常用信息
    if (savedInfo) {
      await prisma.savedInfo.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          personalInfo: savedInfo.personalInfo ? JSON.stringify(savedInfo.personalInfo) : null,
          contactInfo: savedInfo.contactInfo ? JSON.stringify(savedInfo.contactInfo) : null,
          educationInfo: savedInfo.educationInfo ? JSON.stringify(savedInfo.educationInfo) : null,
          workInfo: savedInfo.workInfo ? JSON.stringify(savedInfo.workInfo) : null,
          familyInfo: savedInfo.familyInfo ? JSON.stringify(savedInfo.familyInfo) : null,
        },
        update: {
          personalInfo: savedInfo.personalInfo ? JSON.stringify(savedInfo.personalInfo) : undefined,
          contactInfo: savedInfo.contactInfo ? JSON.stringify(savedInfo.contactInfo) : undefined,
          educationInfo: savedInfo.educationInfo ? JSON.stringify(savedInfo.educationInfo) : undefined,
          workInfo: savedInfo.workInfo ? JSON.stringify(savedInfo.workInfo) : undefined,
          familyInfo: savedInfo.familyInfo ? JSON.stringify(savedInfo.familyInfo) : undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: '资料更新成功',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: '更新资料失败' },
      { status: 500 }
    );
  }
}
