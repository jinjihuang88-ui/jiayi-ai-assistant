// src/app/api/auth/rcic/upload-documents/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rcicId = formData.get('rcicId') as string;
    const idDocument = formData.get('idDocument') as File | null;
    const licenseDocument = formData.get('licenseDocument') as File | null;
    const experienceProof = formData.get('experienceProof') as File | null;
    const videoVerification = formData.get('videoVerification') as File | null;

    if (!rcicId) {
      return NextResponse.json(
        { error: '顾问ID不能为空' },
        { status: 400 }
      );
    }

    // 查找顾问
    const rcic = await prisma.rCIC.findUnique({
      where: { id: rcicId },
    });

    if (!rcic) {
      return NextResponse.json(
        { error: '顾问不存在' },
        { status: 404 }
      );
    }

    // 检查邮箱是否已验证
    if (!rcic.emailVerified) {
      return NextResponse.json(
        { error: '请先验证邮箱' },
        { status: 403 }
      );
    }

    const uploadedFiles: Record<string, string> = {};

    // 上传文件并保存路径
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rcic', rcicId);

    if (idDocument) {
      const bytes = await idDocument.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `id_${Date.now()}_${idDocument.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      // 创建目录（如果不存在）
      await writeFile(filePath, buffer);
      uploadedFiles.idDocument = `/uploads/rcic/${rcicId}/${fileName}`;
    }

    if (licenseDocument) {
      const bytes = await licenseDocument.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `license_${Date.now()}_${licenseDocument.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      uploadedFiles.licenseDocument = `/uploads/rcic/${rcicId}/${fileName}`;
    }

    if (experienceProof) {
      const bytes = await experienceProof.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `experience_${Date.now()}_${experienceProof.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      uploadedFiles.experienceProof = `/uploads/rcic/${rcicId}/${fileName}`;
    }

    if (videoVerification) {
      const bytes = await videoVerification.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `video_${Date.now()}_${videoVerification.name}`;
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      uploadedFiles.videoVerification = `/uploads/rcic/${rcicId}/${fileName}`;
    }

    // 更新数据库
    const updatedRCIC = await prisma.rCIC.update({
      where: { id: rcicId },
      data: {
        ...uploadedFiles,
        approvalStatus: 'under_review', // 提交文档后进入审核状态
      },
    });

    return NextResponse.json({
      message: '文档上传成功，正在审核中',
      rcic: {
        id: updatedRCIC.id,
        approvalStatus: updatedRCIC.approvalStatus,
        uploadedFiles: Object.keys(uploadedFiles),
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: '文档上传失败，请稍后重试' },
      { status: 500 }
    );
  }
}
