export async function onRequestGet(context) {
    // 获取排行榜数据
    const { env } = context;
    let rankData = await env.ABSTRACT_DB.get("leaderboard", { type: "json" });
    if (!rankData) rankData = [];
    return new Response(JSON.stringify(rankData), {
        headers: { "Content-Type": "application/json" }
    });
}

export async function onRequestPost(context) {
    // 提交新分数
    const { request, env } = context;
    const data = await request.json();
    
    let rankData = await env.ABSTRACT_DB.get("leaderboard", { type: "json" });
    if (!rankData) rankData = [];
    
    rankData.push({ name: data.name, score: data.score, rank: data.rank, time: Date.now() });
    // 降序排列并只保留前 50 名
    rankData.sort((a, b) => b.score - a.score);
    rankData = rankData.slice(0, 50);
    
    await env.ABSTRACT_DB.put("leaderboard", JSON.stringify(rankData));
    
    return new Response(JSON.stringify({ success: true }));
}
