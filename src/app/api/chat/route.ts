import { NextRequest, NextResponse } from "next/server";

async function callCoze(messages: any[]) {
  const res = await fetch("https://api.coze.cn/open_api/v2/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.COZE_API_KEY}`,
    },
    body: JSON.stringify({
      bot_id: process.env.COZE_BOT_ID,
      user_id: "web_user",
      stream: false,
      messages,
    }),
  });

  return res.text(); // ⚠️ 不解析，直接拿原始文本
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // ① 第一次：让扣子正常跑（规划 / 检索 / Agent）
    const raw = await callCoze([
      { role: "user", content: message },
    ]);

    // ② 第二次：让扣子“把上面的内容说成人话”
    const final = await callCoze([
      {
        role: "user",
        content:
          "请基于以下内容，为用户生成一段清晰、结构化、可直接阅读的最终回答，不要输出中间过程：\n\n" +
          raw,
      },
    ]);

    return NextResponse.json({ reply: final });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      reply: "系统暂时无法生成回答，请稍后再试。",
    });
  }
}
