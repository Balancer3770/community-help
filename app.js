const state = {
  view: "home",
  previousView: "home",
  helpLocation: null,
  reportLocation: null,
  mediaRecorder: null,
  recordStartedAt: 0,
  recordTimer: null,
  audioChunks: [],
};

const titles = {
  home: "社区便民联络码",
  help: "一键紧急求助",
  quiet: "低调求助模式",
  consult: "AI 便民咨询",
  report: "隐患线索上报",
  services: "码上便民办事",
  contact: "社区联络方式",
  admin: "本地演示台账",
};

const faq = [
  {
    keys: ["居住证", "居住登记", "暂住"],
    answer:
      "居住登记通常需要身份证明、居住地址证明、本人联系方式。不同城市口径会有差异，建议先准备身份证、租房合同或房东证明，再联系社区确认。",
  },
  {
    keys: ["身份证", "补办", "丢了"],
    answer:
      "身份证遗失后建议先确认是否需要挂失，再按当地户政窗口要求办理补领。一般会用到本人身份证明材料、照片回执或现场采集信息。",
  },
  {
    keys: ["户籍", "迁户", "落户"],
    answer:
      "户籍业务差异较大，通常要先确认迁入原因、房产或亲属关系材料、原户籍信息。可以把你的具体情况发给联络员人工确认。",
  },
  {
    keys: ["养狗", "犬", "宠物"],
    answer:
      "养犬事项一般涉及犬只登记、免疫证明、牵绳管理和公共区域文明养犬。发现扰民或安全隐患，可通过线索上报留下时间、地点和照片。",
  },
  {
    keys: ["诈骗", "反诈", "转账", "刷单", "中奖"],
    answer:
      "凡是要求先转账、索要验证码、屏幕共享、刷单返利、冒充客服或公检法的，都要高度警惕。已经转账请尽快拨打 110，并保留聊天、转账记录。",
  },
];

const services = [
  {
    id: "residence",
    name: "居住登记",
    materials: ["本人身份证明", "居住地址证明", "联系电话", "租住人员建议准备租房合同"],
    steps: ["确认居住地址所属社区", "准备材料并提交登记", "等待工作人员核验", "按通知补充材料或领取结果"],
  },
  {
    id: "proof",
    name: "证明咨询",
    materials: ["本人身份证明", "事项说明", "与证明内容相关的辅助材料"],
    steps: ["先说明用途", "确认社区是否有出具权限", "提交材料", "工作人员核验后办理"],
  },
  {
    id: "rental",
    name: "出租房报备",
    materials: ["房主身份证明", "房屋权属或租赁材料", "承租人基本信息", "安全责任承诺"],
    steps: ["登记房屋信息", "登记承租人员", "核验消防和居住安全情况", "完成报备并留档"],
  },
  {
    id: "antiFraud",
    name: "反诈提醒",
    materials: ["诈骗电话或账号", "聊天截图", "转账凭证", "对方要求和话术说明"],
    steps: ["停止沟通和转账", "保存证据", "联系社区或拨打 110", "必要时到派出所报案"],
  },
];

const quickQuestions = ["居住登记需要什么材料", "身份证丢了怎么办", "遇到刷单诈骗怎么办", "邻里噪音怎么处理"];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function getLedger() {
  try {
    return JSON.parse(localStorage.getItem("community-ledger") || "[]");
  } catch {
    return [];
  }
}

function setLedger(items) {
  localStorage.setItem("community-ledger", JSON.stringify(items));
}

function addLedger(item) {
  const items = getLedger();
  items.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    status: "待处理",
    createdAt: new Date().toISOString(),
    ...item,
  });
  setLedger(items);
  renderLedger();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function go(view) {
  if (!titles[view]) return;
  state.previousView = state.view;
  state.view = view;
  $$(".view").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  $("#pageTitle").textContent = titles[view];
  $("#backButton").style.visibility = view === "home" ? "hidden" : "visible";
  if (view === "admin") renderLedger();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getLocation(target) {
  if (!navigator.geolocation) {
    showToast("当前浏览器不支持定位");
    return;
  }

  const box = $(`#${target}Location`);
  box.textContent = "正在获取位置...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const data = {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy: Math.round(accuracy || 0),
      };
      state[`${target}Location`] = data;
      box.innerHTML = `已获取：${data.latitude}, ${data.longitude}<br>精度约 ${data.accuracy} 米`;
      showToast("定位已记录");
    },
    () => {
      box.textContent = "定位失败，请检查浏览器权限，或手动描述位置";
      showToast("定位失败");
    },
    { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 },
  );
}

function startSpeech(target) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("当前浏览器不支持语音转文字，可直接输入文字");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => showToast("请开始说话");
  recognition.onerror = () => showToast("语音识别失败，请改用文字输入");
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    const textarea = $(`#${target}Form textarea[name="content"]`);
    textarea.value = textarea.value ? `${textarea.value}\n${text}` : text;
    showToast("已转成文字");
  };
  recognition.start();
}

function classify(text) {
  const value = text.toLowerCase();
  if (/火|烟|电线|燃气|楼道|消防|充电|电瓶/.test(value)) return "消防隐患";
  if (/打架|吵架|纠纷|噪音|扰民|邻里/.test(value)) return "邻里纠纷";
  if (/违建|占道|乱停|堆放|垃圾|环境/.test(value)) return "环境秩序";
  if (/可疑|盗|骗|酒|闹事|尾随/.test(value)) return "治安隐患";
  return "综合线索";
}

function answerQuestion(question) {
  const hit = faq.find((item) => item.keys.some((key) => question.includes(key)));
  if (hit) return hit.answer;
  return "这个问题需要结合本地口径确认。你可以留下联系方式，或点击社区联络方式转人工处理。";
}

function addMessage(role, text) {
  const box = $("#chatBox");
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;
  box.appendChild(item);
  box.scrollTop = box.scrollHeight;
}

function renderQuickQuestions() {
  const wrap = $("#quickQuestions");
  wrap.innerHTML = "";
  quickQuestions.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = question;
    button.addEventListener("click", () => ask(question));
    wrap.appendChild(button);
  });
}

function ask(question) {
  addMessage("user", question);
  window.setTimeout(() => addMessage("bot", answerQuestion(question)), 280);
}

function renderServices(activeId = services[0].id) {
  const tabs = $("#serviceTabs");
  const detail = $("#serviceDetail");
  tabs.innerHTML = "";
  services.forEach((service) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = service.id === activeId ? "active" : "";
    button.textContent = service.name;
    button.addEventListener("click", () => renderServices(service.id));
    tabs.appendChild(button);
  });

  const active = services.find((service) => service.id === activeId) || services[0];
  detail.innerHTML = `
    <h2>${active.name}</h2>
    <h3>建议准备</h3>
    <ul>${active.materials.map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>办理流程</h3>
    <ol>${active.steps.map((item) => `<li>${item}</li>`).join("")}</ol>
  `;
}

function renderLedger() {
  const items = getLedger();
  const helpCount = items.filter((item) => item.type === "求助").length;
  const reportCount = items.filter((item) => item.type === "线索").length;
  $("#statHelp").textContent = helpCount;
  $("#statReport").textContent = reportCount;
  $("#statOpen").textContent = items.filter((item) => item.status === "待处理").length;

  const list = $("#ledgerList");
  if (!items.length) {
    list.innerHTML = `<div class="ledger-item"><p>暂无本机演示数据。提交求助或线索后会出现在这里。</p></div>`;
    return;
  }

  list.innerHTML = items
    .map((item) => {
      const date = new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false });
      const loc = item.location
        ? `<p>位置：${item.location.latitude}, ${item.location.longitude}，精度约 ${item.location.accuracy} 米</p>`
        : "";
      return `
        <article class="ledger-item">
          <header>
            <div>
              <h3>${item.type} · ${item.category || "未分类"}</h3>
              <time>${date}</time>
            </div>
            <span class="tag">${item.status}</span>
          </header>
          <p>${item.content || "未填写内容"}</p>
          ${item.phone ? `<p>联系电话：${item.phone}</p>` : ""}
          ${loc}
        </article>
      `;
    })
    .join("");
}

function exportLedger() {
  const data = JSON.stringify(getLedger(), null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `community-ledger-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function previewPhoto(input) {
  const file = input.files && input.files[0];
  const preview = $("#reportPreview");
  if (!file) {
    preview.textContent = "未选择照片";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" alt="现场照片预览">`;
  };
  reader.readAsDataURL(file);
}

function updateQuietTimer() {
  const elapsed = Math.floor((Date.now() - state.recordStartedAt) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  $("#quietTimer").textContent = `${minutes}:${seconds}`;
}

async function toggleRecording() {
  const button = $("#recordButton");
  if (state.mediaRecorder && state.mediaRecorder.state === "recording") {
    state.mediaRecorder.stop();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast("当前浏览器不支持录音");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.audioChunks = [];
    state.mediaRecorder = new MediaRecorder(stream);
    state.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) state.audioChunks.push(event.data);
    };
    state.mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      button.classList.remove("recording");
      window.clearInterval(state.recordTimer);
      $("#quietHint").textContent = "录音已保存在本机演示台账中。";
      addLedger({
        type: "求助",
        category: "低调录音",
        content: `低调模式录音 ${state.audioChunks.length} 段。静态演示版仅记录录音事件，正式版需上传到后端存储。`,
        location: state.helpLocation,
      });
      showToast("录音已结束");
    };
    state.mediaRecorder.start();
    state.recordStartedAt = Date.now();
    state.recordTimer = window.setInterval(updateQuietTimer, 500);
    button.classList.add("recording");
    $("#quietHint").textContent = "正在录音，点击红色按钮结束。";
    updateQuietTimer();
  } catch {
    showToast("无法开启录音，请检查浏览器权限");
  }
}

function bindEvents() {
  $("#backButton").addEventListener("click", () => go(state.view === "quiet" ? "help" : "home"));
  $("#adminToggle").addEventListener("click", () => go("admin"));

  document.addEventListener("click", (event) => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) go(goButton.dataset.go);

    const action = event.target.closest("[data-action]");
    if (!action) return;

    if (action.dataset.action === "locate") getLocation(action.dataset.target);
    if (action.dataset.action === "speech") startSpeech(action.dataset.target);
    if (action.dataset.action === "call") window.location.href = `tel:${action.dataset.phone}`;
    if (action.dataset.action === "copy") {
      navigator.clipboard?.writeText(action.dataset.copy);
      showToast("已复制微信号");
    }
    if (action.dataset.action === "map") showToast("正式版可接入高德/腾讯地图导航");
  });

  $("#helpForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addLedger({
      type: "求助",
      category: "普通求助",
      name: form.get("name"),
      phone: form.get("phone"),
      content: form.get("content"),
      location: state.helpLocation,
    });
    event.currentTarget.reset();
    $("#helpLocation").textContent = "尚未获取位置";
    state.helpLocation = null;
    showToast("求助已记录到本地台账");
    go("admin");
  });

  $("#reportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const content = String(form.get("content") || "");
    const selected = form.get("category");
    addLedger({
      type: "线索",
      category: selected === "AI 自动判断" ? classify(content) : selected,
      content,
      location: state.reportLocation,
      hasPhoto: Boolean(form.get("photo")?.name),
    });
    event.currentTarget.reset();
    $("#reportLocation").textContent = "尚未获取位置";
    $("#reportPreview").textContent = "未选择照片";
    state.reportLocation = null;
    showToast("线索已记录到本地台账");
    go("admin");
  });

  $("#reportForm input[name='photo']").addEventListener("change", (event) => previewPhoto(event.target));

  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.currentTarget.elements.question;
    const question = input.value.trim();
    if (!question) return;
    ask(question);
    input.value = "";
  });

  $("#quietLocate").addEventListener("click", () => {
    getLocation("help");
    $("#quietHint").textContent = "已尝试获取位置，结果会同步到求助记录。";
  });
  $("#recordButton").addEventListener("click", toggleRecording);

  $("#exportData").addEventListener("click", exportLedger);
  $("#clearData").addEventListener("click", () => {
    if (!confirm("确定清空本机演示数据吗？")) return;
    setLedger([]);
    renderLedger();
    showToast("已清空");
  });
}

function init() {
  bindEvents();
  renderQuickQuestions();
  renderServices();
  renderLedger();
  addMessage("bot", "你好，我可以先回答常见便民事项。涉及紧急危险，请优先拨打 110 / 120。");
  go("home");
}

init();
