const HOTLINE = "62655555";
const STATION_NAME = "长征派出所";

const state = {
  view: "home",
  speechRecognition: null,
  speechStopRequested: false,
  speechRestartTimer: null,
  reportLocation: null,
};

const titles = {
  home: STATION_NAME,
  report: "隐患线索上报",
  antiFraud: "反诈宣传专栏",
  contact: "社区联络员",
  ledger: "本地演示台账",
};

const officers = [
  { name: "小马警官", phone: "18018838034", area: "长征一社区" },
  { name: "小李警官", phone: "18000000000", area: "长征二社区" },
];

const quickQuestions = [
  "居住登记需要准备什么材料",
  "身份证丢了怎么办",
  "户口迁移需要准备什么",
  "养狗办证要准备什么",
  "楼上噪音扰民怎么办",
];

const consultReplies = [
  {
    keys: ["居住登记", "暂住", "居住证"],
    answer:
      "居住登记通常需要身份证明、居住地址证明和联系电话。租住人员建议同时准备租房合同或房东证明，具体口径可先线上咨询再来所办理。",
  },
  {
    keys: ["身份证", "丢了", "补办"],
    answer:
      "身份证遗失后，可先确认是否需要挂失，再按户政窗口要求办理补领。一般会涉及本人身份证明、照片回执或现场采集信息；如急需使用身份证明，可同步咨询临时身份证明办理方式。",
  },
  {
    keys: ["证明", "开具", "证明咨询"],
    answer:
      "办理前建议先说明用途，再确认社区是否具有出具权限。常见材料包括本人身份证明、事项说明和与证明内容相关的辅助材料。",
  },
  {
    keys: ["出租房", "报备", "出租"],
    answer:
      "出租房报备一般需要房主身份证明、房屋权属或租赁材料、承租人基本信息及安全责任承诺，建议一次性备齐后再办理。",
  },
  {
    keys: ["户籍", "迁户", "落户"],
    answer:
      "户籍业务需要结合迁入原因、房产或亲属关系材料综合判断。你可以先描述具体情况，我们再根据口径提示你准备材料。",
  },
  {
    keys: ["户口", "户口本", "迁移", "户口迁移", "户籍迁移"],
    answer:
      "户口迁移通常需要身份证明、户口簿、迁移原因对应材料，以及落户地址相关证明。不同情形差异较大，比如购房、亲属投靠、工作调动准备材料不一样，建议先说明迁移原因和落户地址。",
  },
  {
    keys: ["养狗", "养犬", "犬证", "狗证", "遛狗"],
    answer:
      "养犬管理通常涉及犬只登记、免疫证明、犬牌犬证和文明牵引。不同城市细则会有差异，建议先准备犬只免疫证明、犬主身份证明和居住信息；遇到不牵绳、犬吠扰民、犬只伤人等情况，可记录时间地点并联系社区民警。",
  },
  {
    keys: ["噪音", "扰民", "楼上", "装修", "广场舞"],
    answer:
      "噪音扰民建议先记录发生时间、持续时长、地点和影响情况。能沟通的可先友好提醒；反复发生或矛盾升级时，可向物业、社区或民警反映，由工作人员结合现场情况协调处理。",
  },
  {
    keys: ["治安管理处罚法", "处罚法", "打架", "辱骂", "恐吓", "纠纷"],
    answer:
      "社区里的打架、威胁恐吓、故意损毁财物等情况，需要结合事实、证据和现场处置判断。线上咨询只能做方向提示，具体处理方式以民警依法核实后的意见为准。",
  },
  {
    keys: ["邻里", "矛盾", "纠纷", "吵架"],
    answer:
      "邻里纠纷建议先保留聊天记录、现场照片、视频或物业沟通记录，说明时间、地点、人员和诉求。一般会优先调解沟通；如涉及殴打、威胁、故意损坏财物等情形，可联系民警依法处理。",
  },
];

const antiFraudPosters = [
  { title: "不轻信", note: "陌生来电先核实身份" },
  { title: "不转账", note: "凡是催促打款都要停一停" },
  { title: "不泄露", note: "验证码和银行卡信息绝不外传" },
];

const antiFraudCards = [
  {
    title: "投资理财类诈骗",
    summary: "以高收益、内幕消息、稳赚不赔为诱饵，引导下载假平台或加入投资群。",
    caseText: "案例：对方先让群众小额盈利，再诱导追加大额资金，最后以系统升级、账户冻结等理由拒绝提现。",
    warnings: ["承诺保本高收益", "群内截图全是盈利", "提现前还要继续充值"],
  },
  {
    title: "冒充客服类诈骗",
    summary: "冒充电商、快递、平台客服，谎称商品有问题或开通了扣费业务，诱导退款转账。",
    caseText: "案例：骗子声称误开会员需关闭扣费，要求屏幕共享或下载远程软件，最终控制手机完成转账。",
    warnings: ["要求下载会议软件", "要求打开屏幕共享", "说关闭业务前必须先转账验证"],
  },
  {
    title: "虚假购物类诈骗",
    summary: "以低价抢购、二手交易、限量货源为名，诱导脱离正规平台私下付款。",
    caseText: "案例：受害人看到低价商品后私聊交易，对方先收定金，再以物流、税费、保证金等名义连续要钱。",
    warnings: ["离开平台私聊交易", "先交定金再发货", "不断追加手续费和保证金"],
  },
];

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
  state.view = view;
  $$(".view").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  $("#pageTitle").textContent = titles[view];
  updateTopLeftButton(view);
  if (view === "ledger") renderLedger();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateTopLeftButton(view) {
  const button = $("#backButton");
  if (view === "home") {
    button.setAttribute("aria-label", "查看本地演示台账");
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>`;
    return;
  }
  button.setAttribute("aria-label", "返回");
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>`;
}

function openBot() {
  $("#botDrawer").hidden = false;
  $("#botLauncher").classList.add("is-open");
}

function closeBot() {
  $("#botDrawer").hidden = true;
  $("#botLauncher").classList.remove("is-open");
}

function startSpeech(target) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("当前浏览器不支持语音识别");
    return;
  }

  if (state.speechRecognition) {
    state.speechStopRequested = true;
    window.clearTimeout(state.speechRestartTimer);
    state.speechRecognition.stop();
    return;
  }

  const textarea = $(`#${target}Form textarea[name="content"]`);
  const button = $(`[data-action="speech"][data-target="${target}"]`);
  const baseText = textarea.value.trim();
  let finalText = "";
  let lastInterimText = "";
  let shouldRestart = true;
  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = true;
  recognition.continuous = true;
  state.speechRecognition = recognition;
  state.speechStopRequested = false;
  let startNoticeShown = false;

  recognition.onstart = () => {
    button.textContent = "结束语音";
    button.classList.add("is-active");
    if (!startNoticeShown) {
      startNoticeShown = true;
      showToast("正在语音录入，再次点击结束");
    }
  };

  recognition.onerror = (event) => {
    const fatalErrors = ["not-allowed", "service-not-allowed", "audio-capture"];
    if (fatalErrors.includes(event.error)) {
      shouldRestart = false;
      state.speechStopRequested = true;
      showToast(event.error === "audio-capture" ? "未检测到麦克风" : "麦克风权限被拒绝");
      return;
    }
    showToast("语音短暂中断，正在继续录入");
  };

  recognition.onend = () => {
    if (shouldRestart && !state.speechStopRequested) {
      state.speechRestartTimer = window.setTimeout(() => {
        try {
          recognition.start();
        } catch {
          state.speechRecognition = null;
          button.textContent = "语音输入";
          button.classList.remove("is-active");
        }
      }, 280);
      return;
    }

    window.clearTimeout(state.speechRestartTimer);
    state.speechRecognition = null;
    state.speechStopRequested = false;
    button.textContent = "语音输入";
    button.classList.remove("is-active");
    if (finalText || lastInterimText) showToast("语音输入已结束");
  };

  recognition.onresult = (event) => {
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript.trim();
      if (event.results[index].isFinal) finalText = `${finalText}${text}`;
      else interimText = `${interimText}${text}`;
    }
    lastInterimText = interimText;
    const spokenText = `${finalText}${interimText}`.trim();
    textarea.value = [baseText, spokenText].filter(Boolean).join(baseText && spokenText ? "\n" : "");
  };

  try {
    recognition.start();
  } catch {
    state.speechRecognition = null;
    state.speechStopRequested = false;
    button.textContent = "语音输入";
    button.classList.remove("is-active");
    showToast("语音启动失败，请重试");
  }
}

function getLocation(target) {
  if (!navigator.geolocation) {
    showToast("当前浏览器不支持定位");
    return;
  }

  const box = $(`#${target}Location`);
  if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
    box.textContent = "当前页面不是安全来源，手机浏览器可能会拒绝定位。请改用 HTTPS，或本机 localhost 演示。";
    showToast("定位需要 HTTPS 安全环境");
    return;
  }

  box.textContent = "正在获取位置...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const data = {
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        accuracy: Math.max(1, Math.round(accuracy || 0)),
      };
      state[`${target}Location`] = data;
      box.innerHTML = `已获取：${data.latitude}, ${data.longitude}<br>精度约 ${data.accuracy} 米`;
      showToast("定位已记录");
    },
    (error) => {
      const messages = {
        1: "定位权限被拒绝，请在浏览器或微信权限里允许访问位置；如使用局域网 http 地址，请改用 HTTPS 后再试。",
        2: "暂时无法获取当前位置，请确认手机 GPS 已开启。",
        3: "定位超时，请到室外或信号较好的地方重试。",
      };
      box.textContent = messages[error.code] || "定位失败，可继续手动填写位置说明。";
      showToast("定位失败");
    },
    { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 },
  );
}

function buildSubmittedLocation(location, manualAddress) {
  const address = String(manualAddress || "").trim();
  if (location) return { ...location, manualAddress: address };
  return address ? { manualAddress: address } : null;
}

function classifyLedger(text) {
  const value = String(text || "").toLowerCase();
  if (/投资|理财|高收益|炒股|返利|内幕/.test(value)) return "疑似投资理财诈骗";
  if (/客服|退款|退费|快递|会员|屏幕共享/.test(value)) return "疑似冒充客服诈骗";
  if (/购物|网购|代购|定金|发货|手续费/.test(value)) return "疑似虚假购物诈骗";
  if (/火|烟|电线|燃气|楼道|消防|充电|电瓶/.test(value)) return "消防隐患";
  if (/打架|吵架|纠纷|噪音|扰民|邻里/.test(value)) return "邻里纠纷";
  if (/违建|占道|乱停|堆放|垃圾|环境/.test(value)) return "环境秩序";
  if (/可疑|盗窃|诈骗|尾随|闹事|酒后/.test(value)) return "治安隐患";
  return "综合线索";
}

function formatLedgerLocation(location) {
  if (!location) return "";
  const lines = [];
  if (location.manualAddress) lines.push(`位置说明：${location.manualAddress}`);
  if (location.latitude && location.longitude) {
    lines.push(`经纬度：${location.latitude}, ${location.longitude}`);
    lines.push(`定位精度约 ${location.accuracy} 米`);
  }
  return lines.join("<br>");
}

function updateStatus(id, status) {
  const items = getLedger().map((item) => (item.id === id ? { ...item, status } : item));
  setLedger(items);
  renderLedger();
  showToast(`已更新为“${status}”`);
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

function clearLedger() {
  if (!confirm("确定清空本机演示数据吗？")) return;
  setLedger([]);
  renderLedger();
  showToast("已清空演示数据");
}

function renderLedger() {
  const items = getLedger();
  $("#statTotal").textContent = items.length;
  $("#statReport").textContent = items.filter((item) => item.type === "线索").length;
  $("#statOpen").textContent = items.filter((item) => item.status !== "已办结").length;

  const list = $("#ledgerList");
  if (!items.length) {
    list.innerHTML = `<div class="ledger-item"><p>暂无本机演示数据。群众提交线索后，会出现在这里供演示处理。</p></div>`;
    return;
  }

  list.innerHTML = items
    .map((item) => {
      const date = new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false });
      const location = formatLedgerLocation(item.location);
      const aiCategory = classifyLedger(item.content);
      return `
        <article class="ledger-item">
          <header>
            <div>
              <h3>AI隐患线索分析：${aiCategory}</h3>
              <time>${date}</time>
            </div>
            <span class="tag">${item.status}</span>
          </header>
          <p>${item.content || "未填写内容"}</p>
          ${item.name ? `<p>姓名：${item.name}</p>` : ""}
          ${item.phone ? `<p>联系电话：${item.phone}</p>` : ""}
          ${item.hasPhoto ? `<p>现场照片：已选择。演示版仅记录有无照片，未上传原图。</p>` : ""}
          ${location ? `<p>${location}</p>` : ""}
          <div class="ledger-actions">
            <button type="button" data-status="跟进中" data-id="${item.id}">标记跟进中</button>
            <button type="button" data-status="已办结" data-id="${item.id}">标记已办结</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function answerQuestion(question) {
  const hit = consultReplies.find((item) => item.keys.some((key) => question.includes(key)));
  if (hit) return hit.answer;
  return `这个问题建议结合具体情况再确认。你可以补充用途、对象或材料情况，或者直接拨打 ${HOTLINE} 咨询。`;
}

function addMessage(role, text) {
  const box = $("#chatBox");
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;
  box.appendChild(item);
  box.scrollTop = box.scrollHeight;
}

function ask(question) {
  addMessage("user", question);
  window.setTimeout(() => addMessage("bot", answerQuestion(question)), 240);
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

function renderOfficers() {
  const list = $("#officerList");
  list.innerHTML = officers
    .map(
      (officer) => `
        <article class="officer-card compact">
          <div class="avatar">${officer.name.slice(0, 1)}</div>
          <div class="officer-body">
            <div class="officer-head">
              <h2>${officer.name}</h2>
              <span class="tag">${officer.area}</span>
            </div>
            <p class="officer-line"><strong>联系电话</strong><span>${officer.phone}</span></p>
            <button class="secondary-button" data-action="call" data-phone="${officer.phone}">拨打 ${officer.phone}</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAntiFraud() {
  $("#antiPosterRow").innerHTML = antiFraudPosters
    .map(
      (poster) => `
        <article class="fraud-poster">
          <strong>${poster.title}</strong>
          <span>${poster.note}</span>
        </article>
      `,
    )
    .join("");

  $("#antiFraudList").innerHTML = antiFraudCards
    .map(
      (card) => `
        <article class="fraud-card">
          <h2>${card.title}</h2>
          <p>${card.summary}</p>
          <div class="fraud-case">${card.caseText}</div>
          <ul>${card.warnings.map((warning) => `<li>${warning}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");
}

function previewPhoto(input) {
  const file = input.files && input.files[0];
  const preview = $("#reportPreview");
  if (!file) {
    preview.textContent = "可不上传照片";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" alt="现场照片预览">`;
  };
  reader.readAsDataURL(file);
}

function bindEvents() {
  $("#backButton").addEventListener("click", () => {
    if (state.view === "home") go("ledger");
    else go("home");
  });
  $("#botLauncher").addEventListener("click", openBot);
  $("#botClose").addEventListener("click", closeBot);

  document.addEventListener("click", (event) => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) go(goButton.dataset.go);

    const action = event.target.closest("[data-action]");
    if (!action) return;

    if (action.dataset.action === "speech") startSpeech(action.dataset.target);
    if (action.dataset.action === "locate") getLocation(action.dataset.target);
    if (action.dataset.action === "call") window.location.href = `tel:${action.dataset.phone}`;
  });

  $("#reportForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addLedger({
      type: "线索",
      category: "",
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      content: String(form.get("content") || ""),
      location: buildSubmittedLocation(state.reportLocation, form.get("manualAddress")),
      hasPhoto: Boolean(form.get("photo")?.name),
    });
    event.currentTarget.reset();
    $("#reportPreview").textContent = "可不上传照片";
    $("#reportLocation").textContent = "尚未获取经纬度";
    state.reportLocation = null;
    showToast("线索已提交");
    go("home");
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

  $("#ledgerList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-status][data-id]");
    if (!button) return;
    updateStatus(button.dataset.id, button.dataset.status);
  });

  $("#exportData").addEventListener("click", exportLedger);
  $("#clearData").addEventListener("click", clearLedger);
}

function init() {
  bindEvents();
  renderQuickQuestions();
  renderOfficers();
  renderAntiFraud();
  addMessage("bot", `你好，我是小长征警官。你可以问我身份证、户口、居住登记、养犬管理、噪音扰民等社区常见问题。`);
  go("home");
}

init();
