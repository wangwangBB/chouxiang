export async function onRequest(context) {
  // 从上下文中获取请求对象和环境变量（KV存储）
  const { request, env } = context;
  const { method } = request;

  // 处理 GET 请求：获取排行榜数据
  if (method === "GET") {
    try {
      const value = await env.ABSTRACT_KV.get("leaderboard");
      return new Response(value || "[]", {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" // 允许跨域
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  // 处理 POST 请求：提交新分数
  if (method === "POST") {
    try {
      const newScore = await request.json();
      
      // 读取现有排行榜
      let currentDataStr = await env.ABSTRACT_KV.get("leaderboard");
      let currentData = currentDataStr ? JSON.parse(currentDataStr) : [];
      
      // 加入新分数并重新排序（从高到低）
      currentData.push(newScore);
      currentData.sort((a, b) => b.score - a.score);
      
      // 只保留前 50 名，节省存储空间
      currentData = currentData.slice(0, 50);

      // 保存回 KV 数据库
      await env.ABSTRACT_KV.put("leaderboard", JSON.stringify(currentData));
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
