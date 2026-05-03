// 오늘의 사주 운세 v3
// 실제 만세력 계산이 아니라, 입력값과 오늘 날짜를 seed로 삼아 매일 같은 결과를 보여줍니다.

const form = document.querySelector("#fortuneForm");
const resultSection = document.querySelector("#result");
const resetButton = document.querySelector("#resetButton");
const copyButton = document.querySelector("#copyButton");
const shareButton = document.querySelector("#shareButton");
const copyStatus = document.querySelector("#copyStatus");
const colorSwatch = document.querySelector("#colorSwatch");
const keywordList = document.querySelector("#keywordList");

let latestFortuneText = "";
let statusTimer;

// 운세 종류별로 자세한 문장과 키워드 후보를 따로 둡니다.
// 문장을 추가하면 같은 로직으로 더 풍성한 운세를 만들 수 있습니다.
const fortuneTypes = {
  total: {
    label: "종합운",
    description: "오늘의 전체 흐름을 넓게 살펴봅니다.",
    details: [
      "오늘은 여러 일이 한꺼번에 보이더라도 우선순위를 정하면 흐름이 안정됩니다. 작은 정리와 짧은 대화가 하루의 방향을 좋게 바꿉니다.",
      "몸과 마음의 속도를 맞추는 것이 중요합니다. 서두르기보다 지금 할 수 있는 일을 하나씩 끝내면 만족감이 커집니다.",
      "새로운 기회는 크게 다가오기보다 작은 힌트처럼 나타납니다. 지나치기 쉬운 제안이나 메시지를 차분히 살펴보세요.",
      "익숙한 루틴 안에서 작은 변화를 주기 좋은 날입니다. 평소와 다른 선택 하나가 기분 좋은 전환점이 됩니다."
    ],
    keywords: ["정리", "균형", "작은 기회", "차분함", "새 흐름", "확인", "전환", "꾸준함"]
  },
  love: {
    label: "연애운",
    description: "관계, 표현, 만남의 흐름을 자세히 봅니다.",
    details: [
      "마음을 표현할 때는 솔직함보다 온도가 더 중요합니다. 짧은 말이라도 다정하게 건네면 관계의 긴장이 부드럽게 풀립니다.",
      "새로운 만남에는 가벼운 호기심이 행운을 부릅니다. 상대를 빨리 판단하기보다 편안한 질문으로 대화를 이어가보세요.",
      "이미 가까운 사람이 있다면 익숙함 속에서 놓친 배려를 챙겨보세요. 작은 고마움 표현이 오늘의 관계운을 밝게 만듭니다.",
      "오해가 생기기 쉬운 날이니 메시지는 짧게 끊기보다 맥락을 함께 전하는 것이 좋습니다. 말의 끝을 부드럽게 남겨보세요."
    ],
    keywords: ["대화", "표현", "배려", "만남", "호감", "속도 조절", "진심", "부드러움"]
  },
  money: {
    label: "금전운",
    description: "소비, 저축, 기회, 신중함을 중심으로 봅니다.",
    details: [
      "오늘은 버는 운보다 지키는 운이 더 강합니다. 작은 지출을 점검하고 필요한 것과 갖고 싶은 것을 나누어 생각해보세요.",
      "돈과 관련된 제안은 겉으로 좋아 보여도 조건을 천천히 확인하는 편이 좋습니다. 신중함이 손실을 막아줍니다.",
      "저축이나 정산처럼 미뤄둔 금전 관리를 하기 좋은 날입니다. 숫자를 직접 확인하면 불안이 줄어듭니다.",
      "새로운 기회가 보이더라도 바로 결정하기보다 비교 목록을 만들어보세요. 오늘의 행운은 차분한 판단 쪽에 있습니다."
    ],
    keywords: ["절약", "점검", "저축", "신중함", "비교", "정산", "기회", "계획"]
  },
  work: {
    label: "일/학업운",
    description: "업무, 공부, 집중력, 성취 흐름을 봅니다.",
    details: [
      "쉬운 일부터 시작하면 집중력이 천천히 올라옵니다. 처음부터 어려운 과제에 매달리기보다 리듬을 만드는 것이 좋습니다.",
      "오늘은 결과보다 과정을 정리할수록 운이 붙습니다. 해야 할 일을 세 가지로 줄이면 실행력이 좋아집니다.",
      "혼자 막힌 부분은 질문을 통해 빠르게 풀릴 수 있습니다. 도움을 요청하는 태도가 오히려 좋은 평가로 이어집니다.",
      "반복되는 작업 안에서 개선점을 발견하기 좋은 날입니다. 작은 자동화나 정리가 내일의 시간을 아껴줍니다."
    ],
    keywords: ["집중", "우선순위", "질문", "정리", "성취", "반복 개선", "기록", "마감"]
  },
  relationship: {
    label: "인간관계운",
    description: "주변 사람, 협업, 거리감, 신뢰를 살펴봅니다.",
    details: [
      "오늘은 관계의 넓이보다 깊이가 중요합니다. 모두에게 맞추기보다 꼭 필요한 사람에게 충분히 집중해보세요.",
      "협업에서는 역할을 분명히 나누면 불필요한 오해가 줄어듭니다. 말하지 않아도 알겠지라는 생각은 잠시 내려두세요.",
      "어색했던 사람과는 가벼운 안부가 좋은 시작점이 됩니다. 큰 대화보다 부담 없는 한마디가 분위기를 바꿉니다.",
      "거절이 필요한 상황에서는 이유를 길게 설명하기보다 가능한 범위를 분명하게 말하는 것이 좋습니다."
    ],
    keywords: ["신뢰", "협업", "거리감", "안부", "경청", "역할", "분명함", "화해"]
  },
  condition: {
    label: "컨디션운",
    description: "몸과 마음의 리듬, 휴식, 회복을 봅니다.",
    details: [
      "몸의 신호를 가볍게 넘기지 않는 것이 오늘의 핵심입니다. 피로가 쌓였다면 짧은 휴식이라도 먼저 챙겨보세요.",
      "컨디션은 오전보다 오후에 안정되기 쉽습니다. 중요한 일은 몸이 풀린 뒤에 처리하면 부담이 줄어듭니다.",
      "마음이 복잡할 때는 환경을 정리하는 것이 도움이 됩니다. 책상 위나 가방 속을 정돈하면 생각도 가벼워집니다.",
      "무리해서 끌고 가기보다 회복 시간을 확보할수록 하루의 만족도가 올라갑니다. 물, 식사, 수면 리듬을 확인해보세요."
    ],
    keywords: ["휴식", "회복", "수면", "산책", "호흡", "정돈", "리듬", "가벼움"]
  }
};

// 기본 운세 항목도 여러 문장 중 하나를 seed로 고릅니다.
const fortunes = {
  overall: [
    "오늘은 흐름을 억지로 바꾸기보다 자연스럽게 따라갈 때 좋은 결과가 생기는 날입니다.",
    "작은 선택 하나가 기분 좋은 변화를 만들 수 있습니다. 평소 미뤄둔 일을 가볍게 시작해보세요.",
    "주변의 말에 흔들리기보다 내 기준을 차분히 세우면 안정적인 하루가 됩니다.",
    "새로운 아이디어가 떠오르기 쉬운 날입니다. 기록해두면 나중에 쓸모가 있습니다.",
    "오전에 정리한 생각이 오후의 선택을 가볍게 만들어줍니다.",
    "익숙한 방식 안에서 작은 변화를 주면 예상보다 좋은 반응을 얻을 수 있습니다.",
    "마음이 급해질수록 기본을 확인하는 태도가 행운을 붙잡아줍니다.",
    "혼자 끌어안던 일이 있다면 오늘은 도움을 청해도 괜찮습니다."
  ],
  love: [
    "솔직하지만 부드러운 표현이 관계를 더 편안하게 만들어줍니다.",
    "상대의 반응을 기다리기보다 먼저 따뜻한 말을 건네면 좋은 기운이 들어옵니다.",
    "오해가 생기기 쉬운 날이니 짧은 메시지보다 직접적인 대화가 좋습니다.",
    "가까운 사람에게 고마움을 표현하면 관계운이 부드럽게 풀립니다.",
    "새로운 인연보다 이미 곁에 있는 사람을 세심히 바라볼 때입니다.",
    "농담처럼 건넨 말이 크게 들릴 수 있으니 표현을 한 번 더 다듬어보세요.",
    "마음에 남은 이야기는 미루지 말고 차분한 톤으로 꺼내는 편이 좋습니다.",
    "작은 약속을 잘 지키는 모습이 신뢰를 키워줍니다."
  ],
  money: [
    "큰 지출보다는 작은 소비를 점검하기 좋은 날입니다.",
    "충동구매만 피하면 금전 흐름은 무난합니다. 비교하고 결정하세요.",
    "새로운 수입 기회보다 기존 자원을 잘 관리하는 데 운이 따릅니다.",
    "돈과 관련된 약속은 기록으로 남겨두는 것이 좋습니다.",
    "할인이나 혜택에 끌리기보다 실제로 필요한지 먼저 따져보세요.",
    "작은 절약이 생각보다 큰 만족으로 돌아올 수 있습니다.",
    "계획에 없던 지출은 하루만 더 생각해보는 것이 좋습니다.",
    "정산하거나 확인할 금액이 있다면 오늘 처리하면 마음이 가벼워집니다."
  ],
  work: [
    "집중력이 천천히 올라오는 날입니다. 쉬운 일부터 처리하면 속도가 붙습니다.",
    "혼자 해결하려 하기보다 주변에 질문하면 의외로 빠른 답을 얻을 수 있습니다.",
    "디테일을 챙길수록 좋은 평가를 받을 수 있습니다.",
    "새로운 업무나 공부를 시작하기보다 기존 내용을 정리하기 좋은 날입니다.",
    "우선순위를 세 가지로 줄이면 오늘 해야 할 일이 선명해집니다.",
    "반복되는 작업에서 개선점을 찾기 좋은 날입니다.",
    "결과를 서두르기보다 중간 과정을 공유하면 신뢰가 높아집니다.",
    "잠깐 막히는 부분은 시간을 정해두고 다시 보면 실마리가 보입니다."
  ],
  caution: [
    "한 번에 너무 많은 일을 잡으면 중요한 부분을 놓칠 수 있습니다.",
    "확인하지 않은 이야기를 그대로 믿기보다 출처를 한 번 더 살펴보세요.",
    "감정이 앞설 때 바로 답하지 말고 잠시 숨을 고르는 편이 좋습니다.",
    "익숙한 길이라고 방심하면 작은 실수가 생길 수 있습니다.",
    "상대의 침묵을 부정적으로 단정하지 않는 것이 좋습니다.",
    "속도를 내고 싶어도 오늘은 마감과 약속 시간을 먼저 확인하세요.",
    "무리한 지출이나 과한 약속은 내일의 부담이 될 수 있습니다.",
    "몸의 피로 신호를 가볍게 넘기지 말고 쉬는 시간을 챙겨보세요."
  ],
  advice: [
    "오늘의 행운은 천천히, 그러나 분명하게 움직이는 사람에게 머뭅니다.",
    "말을 줄이고 관찰을 늘리면 놓쳤던 기회가 보입니다.",
    "기분이 흐트러질 때는 따뜻한 음료 한 잔과 짧은 산책이 도움이 됩니다.",
    "완벽하게 하려는 마음보다 끝까지 해보는 태도가 행운을 부릅니다.",
    "오늘의 나를 너무 다그치지 말고, 해낸 일을 먼저 인정해보세요.",
    "작은 친절 하나가 하루의 방향을 바꿀 수 있습니다.",
    "마음이 복잡할수록 책상 위부터 정리해보세요.",
    "좋은 운은 준비된 여유를 좋아합니다."
  ]
};

const elementEnergies = [
  {
    name: "목",
    title: "목(木) - 성장과 시작",
    message: "새로운 시도와 배움의 기운이 강합니다. 작게라도 시작해보면 흐름이 열립니다."
  },
  {
    name: "화",
    title: "화(火) - 표현과 열정",
    message: "말과 행동에 온기가 실리는 날입니다. 자신감을 조금 더 드러내도 좋습니다."
  },
  {
    name: "토",
    title: "토(土) - 안정과 정리",
    message: "흩어진 일을 모으고 균형을 잡기 좋습니다. 정리할수록 마음도 단단해집니다."
  },
  {
    name: "금",
    title: "금(金) - 판단과 결실",
    message: "기준을 세우고 선택하기 좋은 날입니다. 중요한 결정은 차분히 비교해보세요."
  },
  {
    name: "수",
    title: "수(水) - 지혜와 유연함",
    message: "대화와 정보 수집에 유리합니다. 부드럽게 방향을 바꾸면 좋은 답이 보입니다."
  }
];

const luckyColors = [
  { name: "청록색", hex: "#0f766e" },
  { name: "살구색", hex: "#f59e7d" },
  { name: "라벤더", hex: "#8b7cf6" },
  { name: "올리브 그린", hex: "#6b8e23" },
  { name: "코랄 핑크", hex: "#ec4899" },
  { name: "스카이 블루", hex: "#38bdf8" },
  { name: "아이보리", hex: "#f8f1df" },
  { name: "차콜 그레이", hex: "#374151" }
];

// 문자열을 숫자로 바꾸는 간단한 해시 함수입니다.
// 같은 seed가 들어오면 언제나 같은 숫자가 나오기 때문에 오늘 하루 결과가 유지됩니다.
function hashSeed(seed) {
  let hash = 2166136261;

  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function getSeededIndex(seed, length) {
  return hashSeed(seed) % length;
}

function pickBySeed(seed, list) {
  return list[getSeededIndex(seed, list.length)];
}

// seed를 조금씩 바꿔가며 중복 없는 키워드 3개를 고릅니다.
function pickManyBySeed(seed, list, count) {
  const picked = [];

  for (let i = 0; picked.length < count && i < list.length * 2; i += 1) {
    const candidate = pickBySeed(`${seed}-keyword-${i}`, list);

    if (!picked.includes(candidate)) {
      picked.push(candidate);
    }
  }

  return picked;
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 입력값, 오늘 날짜, 운세 종류를 하나의 seed로 묶어 운세 결과 객체를 만듭니다.
function createFortune({ name, birthDate, birthTime, gender, fortuneType }) {
  const todayKey = getTodayKey();
  const selectedType = fortuneTypes[fortuneType] ?? fortuneTypes.total;
  const seed = `${name}-${birthDate}-${birthTime}-${gender}-${fortuneType}-${todayKey}`;
  const element = pickBySeed(`${seed}-element`, elementEnergies);
  const color = pickBySeed(`${seed}-color`, luckyColors);

  return {
    todayKey,
    selectedType,
    focusedFortune: pickBySeed(`${seed}-focused`, selectedType.details),
    keywords: pickManyBySeed(seed, selectedType.keywords, 3),
    element,
    color,
    luckyNumber: (hashSeed(`${seed}-number`) % 99) + 1,
    overall: `${element.message} ${pickBySeed(`${seed}-overall`, fortunes.overall)}`,
    love: pickBySeed(`${seed}-love`, fortunes.love),
    money: pickBySeed(`${seed}-money`, fortunes.money),
    work: pickBySeed(`${seed}-work`, fortunes.work),
    caution: pickBySeed(`${seed}-caution`, fortunes.caution),
    advice: pickBySeed(`${seed}-advice`, fortunes.advice)
  };
}

// 화면에 보이는 운세를 복사/공유하기 좋은 문장으로 정리합니다.
function buildFortuneText(userData, fortune) {
  return [
    `${userData.name}님의 ${fortune.selectedType.label} (${fortune.todayKey})`,
    `생년월일: ${userData.birthDate}`,
    `태어난 시간: ${userData.birthTime}`,
    `오늘의 키워드: ${fortune.keywords.join(", ")}`,
    `오늘의 오행 기운: ${fortune.element.title}`,
    `행운의 색: ${fortune.color.name}`,
    `행운의 숫자: ${fortune.luckyNumber}`,
    "",
    `[${fortune.selectedType.label}] ${fortune.focusedFortune}`,
    `[총운] ${fortune.overall}`,
    `[애정운] ${fortune.love}`,
    `[금전운] ${fortune.money}`,
    `[일/학업운] ${fortune.work}`,
    `[주의할 점] ${fortune.caution}`,
    `[오늘의 한마디] ${fortune.advice}`,
    "",
    "본 서비스는 오락과 자기성찰용입니다. 입력한 정보는 서버에 저장되지 않습니다."
  ].join("\n");
}

function showStatus(message) {
  clearTimeout(statusTimer);
  copyStatus.textContent = message;
  statusTimer = setTimeout(() => {
    copyStatus.textContent = "";
  }, 2400);
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // 오래된 브라우저를 위한 복사 방식입니다.
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.className = "clipboard-helper";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard fallback failed");
  }
}

function renderKeywords(keywords) {
  keywordList.innerHTML = "";

  keywords.forEach((keyword) => {
    const badge = document.createElement("span");
    badge.className = "keyword-badge";
    badge.textContent = keyword;
    keywordList.appendChild(badge);
  });
}

// 계산된 운세 결과를 HTML 요소에 넣어 화면에 표시합니다.
function renderFortune(userData, fortune) {
  document.querySelector("#selectedFortuneType").textContent = fortune.selectedType.label;
  document.querySelector("#resultTitle").textContent = `${userData.name}님의 ${fortune.selectedType.label}`;
  document.querySelector("#resultMeta").textContent = `${userData.birthDate} · ${userData.birthTime} · ${fortune.todayKey}`;
  document.querySelector("#focusedFortune").textContent = fortune.focusedFortune;
  document.querySelector("#elementEnergy").textContent = fortune.element.title;
  document.querySelector("#elementMessage").textContent = fortune.element.message;
  document.querySelector("#luckyColor").textContent = fortune.color.name;
  document.querySelector("#luckyNumber").textContent = fortune.luckyNumber;
  document.querySelector("#overall").textContent = fortune.overall;
  document.querySelector("#love").textContent = fortune.love;
  document.querySelector("#money").textContent = fortune.money;
  document.querySelector("#work").textContent = fortune.work;
  document.querySelector("#caution").textContent = fortune.caution;
  document.querySelector("#advice").textContent = fortune.advice;

  colorSwatch.style.backgroundColor = fortune.color.hex;
  renderKeywords(fortune.keywords);
  latestFortuneText = buildFortuneText(userData, fortune);
}

// 폼을 제출하면 운세를 만들고 결과 카드를 보여줍니다.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const userData = {
    name: document.querySelector("#name").value.trim(),
    birthDate: document.querySelector("#birthDate").value,
    birthTime: document.querySelector("#birthTime").value,
    gender: document.querySelector("#gender").value,
    fortuneType: document.querySelector("#fortuneType").value
  };

  const fortune = createFortune(userData);

  renderFortune(userData, fortune);
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

// 현재 표시된 운세 전문을 클립보드에 복사합니다.
copyButton.addEventListener("click", async () => {
  if (!latestFortuneText) return;

  try {
    await copyToClipboard(latestFortuneText);
    showStatus("복사 완료!");
  } catch (error) {
    showStatus("복사에 실패했어요. 브라우저 권한을 확인해주세요.");
  }
});

// 모바일 공유를 우선 사용하고, 지원하지 않으면 공유 문구를 복사합니다.
shareButton.addEventListener("click", async () => {
  if (!latestFortuneText) return;

  const shareData = {
    title: "오늘의 사주 운세",
    text: latestFortuneText
  };

  try {
    if (navigator.share && navigator.canShare?.(shareData) !== false) {
      await navigator.share(shareData);
      showStatus("공유창을 열었어요.");
      return;
    }

    await copyToClipboard(latestFortuneText);
    showStatus("공유 문구를 복사했어요!");
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    try {
      await copyToClipboard(latestFortuneText);
      showStatus("공유가 어려워 문구를 복사했어요.");
    } catch (copyError) {
      showStatus("공유와 복사에 실패했어요. 브라우저 권한을 확인해주세요.");
    }
  }
});

resetButton.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  latestFortuneText = "";
  copyStatus.textContent = "";

  // 처음으로 돌아가는 동작을 초보자도 이해하기 쉽도록 폼까지 초기화합니다.
  form.reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
