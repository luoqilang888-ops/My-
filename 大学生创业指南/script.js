const stages = [
  {
    title: "问题发现",
    goal: "把“我觉得有需求”改成“某类人正在被某个问题持续困扰”。",
    actions: ["写下 3 个具体使用场景", "找到 10 个目标用户候选人", "观察他们现在如何解决问题"],
    outputs: ["问题陈述", "目标用户画像", "现有替代方案列表"],
  },
  {
    title: "用户验证",
    goal: "用真实谈话验证问题频率、痛苦程度和付费意愿。",
    actions: ["完成 10 次半结构化访谈", "记录用户原话和行为证据", "判断需求是高频、刚需还是低频强痛点"],
    outputs: ["访谈纪要", "需求证据表", "前三个核心假设"],
  },
  {
    title: "MVP 原型",
    goal: "用最小成本做出能验证核心价值的版本，不追求完整产品。",
    actions: ["只保留一个核心功能", "用手工服务、表单或低代码完成流程", "让 5 个用户真实试用"],
    outputs: ["原型链接", "试用反馈", "下一轮迭代清单"],
  },
  {
    title: "校园试点",
    goal: "在一个小范围校园场景里跑通获客、交付和反馈闭环。",
    actions: ["选择一个学院、社团或宿舍楼试点", "设定一周内可衡量指标", "收集推荐、留存和复用意愿"],
    outputs: ["试点数据", "用户案例", "获客渠道记录"],
  },
  {
    title: "商业化",
    goal: "验证用户是否愿意持续付费，以及单位经济模型是否合理。",
    actions: ["测试 2 到 3 个价格", "计算单个用户获取成本", "找出复购或续费触发点"],
    outputs: ["定价表", "收入成本表", "复购假设"],
  },
  {
    title: "路演融资",
    goal: "把故事、数据和增长路径讲成一个可信的创业项目。",
    actions: ["梳理问题、方案、市场、团队和数据", "准备 5 分钟路演稿", "让导师和真实用户各反馈一次"],
    outputs: ["BP 初稿", "路演稿", "数据证据页"],
  },
];

const stageCards = document.querySelectorAll(".stage-card");
const stageTitle = document.querySelector("#stageTitle");
const stageGoal = document.querySelector("#stageGoal");
const stageActions = document.querySelector("#stageActions");
const stageOutputs = document.querySelector("#stageOutputs");

function renderStage(index) {
  const stage = stages[index];
  stageCards.forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.stage) === index);
  });
  stageTitle.textContent = stage.title;
  stageGoal.textContent = stage.goal;
  stageActions.innerHTML = stage.actions.map((item) => `<li>${item}</li>`).join("");
  stageOutputs.innerHTML = stage.outputs.map((item) => `<li>${item}</li>`).join("");
}

stageCards.forEach((card) => {
  card.addEventListener("click", () => renderStage(Number(card.dataset.stage)));
});

renderStage(0);

const scoreForm = document.querySelector("#scoreForm");
const scoreValue = document.querySelector("#scoreValue");
const scoreLabel = document.querySelector("#scoreLabel");
const scoreFill = document.querySelector("#scoreFill");

function updateScore() {
  const values = [...scoreForm.querySelectorAll("input")].map((input) => Number(input.value));
  scoreForm.querySelectorAll("output").forEach((output, index) => {
    output.value = values[index];
    output.textContent = values[index];
  });

  const [pain, user, access, pay] = values;
  const normalizedAccess = 11 - access;
  const total = Math.round(((pain + user + normalizedAccess + pay) / 40) * 100);
  scoreValue.textContent = total;
  scoreFill.style.width = `${total}%`;

  if (total >= 78) {
    scoreLabel.textContent = "值得进入 MVP 验证，尽快找真实用户试用";
  } else if (total >= 55) {
    scoreLabel.textContent = "可以继续访谈，不急着开发";
  } else {
    scoreLabel.textContent = "先缩小用户和场景，重新定义问题";
  }
}

scoreForm.addEventListener("input", updateScore);
updateScore();

const budgetInputs = ["costTools", "costSample", "costMarketing"].map((id) => document.querySelector(`#${id}`));
const budgetTotal = document.querySelector("#budgetTotal");

function updateBudget() {
  const total = budgetInputs.reduce((sum, input) => sum + Math.max(0, Number(input.value || 0)), 0);
  budgetTotal.textContent = total.toLocaleString("zh-CN");
}

budgetInputs.forEach((input) => input.addEventListener("input", updateBudget));
updateBudget();

const canvas = document.querySelector("#orbitCanvas");
const ctx = canvas.getContext("2d");
let frame = 0;

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawOrbit() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  const centerX = width * 0.52;
  const centerY = height * 0.42;
  const radiusX = Math.min(width * 0.34, 230);
  const radiusY = Math.min(height * 0.22, 130);

  ctx.lineWidth = 1.4;
  ctx.strokeStyle = "rgba(22, 138, 84, 0.22)";
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX - i * 28, radiusY - i * 15, -0.12, 0, Math.PI * 2);
    ctx.stroke();
  }

  const labels = ["想法", "访谈", "MVP", "试点", "成交", "路演"];
  labels.forEach((label, index) => {
    const angle = frame * 0.008 + index * ((Math.PI * 2) / labels.length);
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;

    ctx.beginPath();
    ctx.fillStyle = index === 0 ? "#168a54" : "#ffffff";
    ctx.strokeStyle = index === 0 ? "#168a54" : "rgba(23, 32, 51, 0.2)";
    ctx.lineWidth = 1.2;
    ctx.roundRect(x - 38, y - 22, 76, 44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = index === 0 ? "#ffffff" : "#172033";
    ctx.font = "700 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 1);
  });

  ctx.fillStyle = "#172033";
  ctx.font = "850 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("校园创业实验台", centerX, centerY - 8);
  ctx.fillStyle = "#667085";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText("小步验证，比大步幻想更可靠", centerX, centerY + 24);

  frame += 1;
  requestAnimationFrame(drawOrbit);
}

window.addEventListener("resize", fitCanvas);
fitCanvas();
drawOrbit();
