// src/lib/email.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@jiayi.co';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || '加移顾问平台';

// 邮件中的链接必须使用自定义域名 https://www.jiayi.co，国内访问 *.vercel.app 易超时或无法打开
function getAppUrl(): string {
  if (process.env.APP_URL) {
    const u = process.env.APP_URL.trim();
    return u.startsWith('http') ? u : `https://${u}`;
  }
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV;
  if (env === 'production') return 'https://www.jiayi.co';
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const u = process.env.NEXT_PUBLIC_APP_URL.trim();
    return u.startsWith('http') ? u : `https://${u}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// 发送验证邮件
export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = getAppUrl();
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [email],
      subject: '验证您的邮箱地址 - 加移顾问平台',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>验证您的邮箱</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">加移顾问平台</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">验证您的邮箱地址</h2>
                      <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        感谢您注册加移顾问平台！请点击下方按钮验证您的邮箱地址以激活账户。
                      </p>
                      <p style="margin: 0 0 30px; color: #718096; font-size: 14px;">
                        此验证链接将在 24 小时后过期。
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                              验证邮箱
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        如果按钮无法点击，请复制以下链接到浏览器：<br>
                        <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #718096; font-size: 14px; text-align: center;">
                        如果您没有注册此账户，请忽略此邮件。
                      </p>
                      <p style="margin: 10px 0 0; color: #a0aec0; font-size: 12px; text-align: center;">
                        © 2026 加移顾问平台. 保留所有权利。
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

// 发送欢迎邮件
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [email],
      subject: '欢迎加入加移顾问平台！',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>欢迎加入</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 欢迎加入！</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">您好，${name}！</h2>
                      <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        欢迎加入加移顾问平台！您的账户已成功激活。
                      </p>
                      <p style="margin: 0 0 30px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        我们致力于为您提供专业的移民咨询服务，帮助您实现移民梦想。
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${getAppUrl()}/auth/login" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                              立即登录
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                        © 2026 加移顾问平台. 保留所有权利。
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [email],
      subject: '重置您的密码 - 加移顾问平台',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>重置密码</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 重置密码</h1>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">重置您的密码</h2>
                      <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        我们收到了您的密码重置请求。点击下方按钮设置新密码。
                      </p>
                      <p style="margin: 0 0 30px; color: #718096; font-size: 14px;">
                        此链接将在 1 小时后过期。如果您没有请求重置密码，请忽略此邮件。
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                              重置密码
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        如果按钮无法点击，请复制以下链接到浏览器：<br>
                        <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                        © 2026 加移顾问平台. 保留所有权利。
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

// 案件跟进人通知：收到文件/图片
export async function sendCaseFollowerFileNotification(
  email: string,
  options?: { caseTitle?: string }
) {
  const appUrl = getAppUrl();
  const messagesUrl = `${appUrl}/rcic/messages`;
  const caseTitle = options?.caseTitle ? `「${options.caseTitle}」` : '';

  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [email],
      subject: `[加移顾问平台] 您负责的案件${caseTitle}收到新文件/图片`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <tr><td style="padding:24px 32px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px 12px 0 0;">
                  <h1 style="margin:0;color:#fff;font-size:22px;">加移顾问平台 · 案件通知</h1>
                </td></tr>
                <tr><td style="padding:32px;">
                  <p style="margin:0 0 16px;color:#4a5568;font-size:16px;line-height:1.6;">
                    您负责的案件${caseTitle}有会员发送了文件或图片，请登录后台查看并回复。
                  </p>
                  <p style="margin:0 0 24px;color:#718096;font-size:14px;">请及时登录消息中心处理。</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td align="center">
                      <a href="${messagesUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">前往消息</a>
                    </td></tr>
                  </table>
                </td></tr>
                <tr><td style="padding:20px 32px;background:#f7fafc;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">© 2026 加移顾问平台</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    if (error) {
      console.error('Failed to send case follower file notification:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error sending case follower file notification:', error);
    return { success: false, error };
  }
}

// 案件跟进人通知：未接视频/语音通话
export async function sendCaseFollowerMissedCallNotification(
  email: string,
  callType: 'video' | 'voice',
  options?: { caseTitle?: string }
) {
  const appUrl = getAppUrl();
  const messagesUrl = `${appUrl}/rcic/messages`;
  const caseTitle = options?.caseTitle ? `「${options.caseTitle}」` : '';
  const callLabel = callType === 'video' ? '视频通话' : '语音通话';

  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [email],
      subject: `[加移顾问平台] 您负责的案件${caseTitle}有未接的${callLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <tr><td style="padding:24px 32px;text-align:center;background:linear-gradient(135deg,#e53e3e 0%,#c53030 100%);border-radius:12px 12px 0 0;">
                  <h1 style="margin:0;color:#fff;font-size:22px;">未接${callLabel}</h1>
                </td></tr>
                <tr><td style="padding:32px;">
                  <p style="margin:0 0 16px;color:#4a5568;font-size:16px;line-height:1.6;">
                    您负责的案件${caseTitle}有会员发起了${callLabel}，但未接听。请登录后台查看消息并适时回拨或回复。
                  </p>
                  <p style="margin:0 0 24px;color:#718096;font-size:14px;">请及时登录消息中心处理。</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td align="center">
                      <a href="${messagesUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#e53e3e 0%,#c53030 100%);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">前往消息</a>
                    </td></tr>
                  </table>
                </td></tr>
                <tr><td style="padding:20px 32px;background:#f7fafc;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">© 2026 加移顾问平台</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    if (error) {
      console.error('Failed to send case follower missed call notification:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error sending case follower missed call notification:', error);
    return { success: false, error };
  }
}

// 发送RCIC邮箱验证邮件
export async function sendRCICVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${getAppUrl()}/rcic/verify?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: [email],
      subject: '验证您的顾问邮箱地址 - 加移顾问平台',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>验证您的顾问邮箱</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎓 移民顾问注册</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">您好，${name}！</h2>
                      <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                        感谢您申请成为加移顾问平台的注册移民顾问！请点击下方按钮验证您的邮箱地址。
                      </p>
                      <p style="margin: 0 0 30px; color: #718096; font-size: 14px;">
                        验证邮箱后，您的申请将进入审核流程。我们会在 1-3 个工作日内完成审核并通知您。
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                              验证邮箱
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                        如果按钮无法点击，请复制以下链接到浏览器：<br>
                        <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #718096; font-size: 14px; text-align: center;">
                        如果您没有申请成为顾问，请忽略此邮件。
                      </p>
                      <p style="margin: 10px 0 0; color: #a0aec0; font-size: 12px; text-align: center;">
                        © 2026 加移顾问平台. 保留所有权利。
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send RCIC verification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending RCIC verification email:', error);
    return { success: false, error };
  }
}
