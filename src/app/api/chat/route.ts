import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!process.env.COZE_API_KEY) {
      return NextResponse.json({
        reply: "API 配置错误，请联系管理员。",
      });
    }

    const botId = process.env.COZE_BOT_ID || "7598385173373190195";

    const res = await fetch("https://api.coze.cn/open_api/v2/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COZE_API_KEY}`,
      },
      body: JSON.stringify({
        bot_id: botId,
        user: "web_user_" + Date.now(),
        query: message,
        stream: false,
      }),
    });

    if (!res.ok) {
      console.error("Coze API error:", res.status, res.statusText);
      return NextResponse.json({
        reply: "AI 服务暂时不可用，请稍后再试。",
      });
    }

    const data = await res.json();

    // 解析扣子返回的消息
    let reply = "抱歉，我暂时无法回答这个问题。";

    if (data.messages && Array.isArray(data.messages)) {
      // 查找 answer 类型的消息
      const answerMsg = data.messages.find(
        (m: any) => m.type === "answer" && m.content
      );
      if (answerMsg) {
        reply = answerMsg.content;
      } else {
        // 如果没有 answer，尝试获取最后一条 assistant 消息
        const assistantMsgs = data.messages.filter(
          (m: any) => m.role === "assistant" && m.content
        );
        if (assistantMsgs.length > 0) {
          reply = assistantMsgs[assistantMsgs.length - 1].content;
        }
      }
    } else if (data.msg) {
      // 错误消息
      console.error("Coze error:", data.msg);
      reply = "AI 服务返回错误，请稍后再试。";
    }

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json({
      reply: "系统暂时无法生成回答，请稍后再试。",
    });
  }
}
