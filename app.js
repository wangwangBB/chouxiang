let currentStep = 0;
let score = 0;
const totalSteps = 20;

// 题目配置，混合普通题和小游戏
const questions = [
    {
        type: "choice",
        text: "请问昨天是明天的什么？",
        options: ["大后天", "薛定谔的猫", "星期八", "前天"],
        correct: 1 // 选最抽象的
    },
    {
        type: "game_button",
        text: "小游戏：请点击下方的按钮进入下一题",
        render: (container) => {
            const btn = document.createElement("button");
            btn.innerText = "点我";
            btn.style.position = "absolute";
            // 抽象小游戏：躲避按钮
            btn.onmouseover = () => {
                btn.style.top = Math.random() * 80 + "%";
                btn.style.left = Math.random() * 80 + "%";
            };
            btn.onclick = () => nextStep(10); // 加分并进入下一题
            container.appendChild(btn);
        }
    }
    // ... 后续补充剩余18题
];

function updateProgress() {
    document.getElementById("progress-bar").value = currentStep;
    document.getElementById("progress-text").innerText = `进度: ${currentStep} / ${totalSteps}`;
}

function startTest() {
    currentStep = 0;
    score = 0;
    nextStep(0);
}

function nextStep(points = 0) {
    score += points;
    const container = document.getElementById("question-container");
    container.innerHTML = ""; 

    if (currentStep < questions.length) {
        const q = questions[currentStep];
        const title = document.createElement("h3");
        title.innerText = q.text;
        container.appendChild(title);

        if (q.type === "choice") {
            q.options.forEach((opt, index) => {
                const btn = document.createElement("button");
                btn.innerText = opt;
                btn.onclick = () => nextStep(index === q.correct ? 10 : 0);
                container.appendChild(btn);
            });
        } else if (q.type.startsWith("game")) {
            q.render(container);
        }
        currentStep++;
        updateProgress();
    } else {
        updateProgress();
        finishTest();
    }
}

async function finishTest() {
    const container = document.getElementById("question-container");
    let rank = score > 150 ? "Lv.4 抽象大帝" : score > 100 ? "Lv.3 赛博精神病" : "Lv.1 碳基生物";
    container.innerHTML = `<h2>测试结束！</h2><p>你的抽象得分: ${score}</p><p>鉴定结果: ${rank}</p>`;
    
    // 提交分数到 Cloudflare
    const username = prompt("输入你的代号以上传排行榜：") || "匿名抽象人";
    await fetch("/api/rank", {
        method: "POST",
        body: JSON.stringify({ name: username, score: score, rank: rank })
    });
    
    loadLeaderboard();
}
