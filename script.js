const form = document.querySelector("#fortuneForm");
const submitButton = form.querySelector("button[type='submit']");
const birthTimeSelect = document.querySelector("#birthTime");
const resultSection = document.querySelector("#result");
const resetButton = document.querySelector("#resetButton");
const shareButton = document.querySelector("#shareButton");
const aiStatus = document.querySelector("#aiStatus");
const colorSwatch = document.querySelector("#colorSwatch");
const keywordList = document.querySelector("#keywordList");

const MAX_DAILY_AI_GENERATIONS = 5;
const AI_USAGE_STORAGE_KEY = "sajuDailyAiUsage";

let latestFortuneText = "";
let statusTimer;

const fortunes = {
  overall: [
    "오늘은 흐름을 억지로 바꾸기보다 자연스럽게 따라갈 때 좋은 결과가 생기는 날입니다.",
    "작은 선택 하나가 기분 좋은 변화를 만들 수 있습니다. 평소 미뤄둔 일을 가볍게 시작해보세요.",
    "주변의 말에 흔들리기보다 내 기준을 차분히 세우면 안정적인 하루가 됩니다.",
    "새로운 아이디어가 떠오르기 쉬운 날입니다. 기록해두면 나중에 쓸모가 있습니다.",
    "오전에 정리한 생각이 오후의 선택을 가볍게 만들어줍니다.",
    "익숙한 방식 안에서 작은 변화를 주면 예상보다 좋은 반응을 얻을 수 있습니다."
  ],
  love: [
    "솔직하지만 부드러운 표현이 관계를 더 편안하게 만들어줍니다.",
    "상대의 반응을 기다리기보다 먼저 따뜻한 말을 건네면 좋은 기운이 들어옵니다.",
    "오해가 생기기 쉬운 날이니 짧은 메시지보다 직접적인 대화가 좋습니다.",
    "가까운 사람에게 고마움을 표현하면 관계운이 부드럽게 풀립니다.",
    "작은 약속을 잘 지키는 모습이 신뢰를 키워줍니다."
  ],
  money: [
    "큰 지출보다는 작은 소비를 점검하기 좋은 날입니다.",
    "충동구매만 피하면 금전 흐름은 무난합니다. 비교하고 결정하세요.",
    "새로운 수입 기회보다 기존 자원을 잘 관리하는 데 운이 따릅니다.",
    "돈과 관련된 약속은 기록으로 남겨두는 것이 좋습니다.",
    "계획에 없던 지출은 하루만 더 생각해보는 것이 좋습니다."
  ],
  work: [
    "집중력이 천천히 올라오는 날입니다. 쉬운 일부터 처리하면 속도가 붙습니다.",
    "혼자 해결하려 하기보다 주변에 질문하면 의외로 빠른 답을 얻을 수 있습니다.",
    "디테일을 챙길수록 좋은 평가를 받을 수 있습니다.",
    "새로운 업무나 공부를 시작하기보다 기존 내용을 정리하기 좋은 날입니다.",
    "우선순위를 세 가지로 줄이면 오늘 해야 할 일이 선명해집니다."
  ],
  caution: [
    "한 번에 너무 많은 일을 잡으면 중요한 부분을 놓칠 수 있습니다.",
    "확인하지 않은 이야기를 그대로 믿기보다 출처를 한 번 더 살펴보세요.",
    "감정이 앞설 때 바로 답하지 말고 잠시 숨을 고르는 편이 좋습니다.",
    "속도를 내고 싶어도 오늘은 마감과 약속 시간을 먼저 확인하세요.",
    "몸의 피로 신호를 가볍게 넘기지 말고 쉬는 시간을 챙겨보세요."
  ],
  advice: [
    "오늘의 행운은 천천히, 그러나 분명하게 움직이는 사람에게 머뭅니다.",
    "말을 줄이고 관찰을 늘리면 놓쳤던 기회가 보입니다.",
    "기분이 흐트러질 때는 따뜻한 음료 한 잔과 짧은 산책이 도움이 됩니다.",
    "완벽하게 하려는 마음보다 끝까지 해보는 태도가 행운을 부릅니다.",
    "좋은 운은 준비된 여유를 좋아합니다."
  ]
};

const elementEnergies = [
  {
    title: "목(木)",
    message: "새로운 시도와 배움의 기운이 강합니다. 작게라도 시작해보면 흐름이 열립니다."
  },
  {
    title: "화(火)",
    message: "말과 행동에 온기가 실리는 날입니다. 자신감을 조금 더 드러내도 좋습니다."
  },
  {
    title: "토(土)",
    message: "흩어진 일을 모으고 균형을 잡기 좋습니다. 정리할수록 마음도 단단해집니다."
  },
  {
    title: "금(金)",
    message: "기준을 세우고 선택하기 좋은 날입니다. 중요한 결정은 차분히 비교해보세요."
  },
  {
    title: "수(水)",
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

const defaultKeywords = [
  "정리",
  "대화",
  "작은 기회",
  "균형",
  "차분함",
  "집중",
  "배려",
  "점검",
  "전환",
  "휴식"
];

const colorHexMap = {
  초록: "#22c55e",
  녹색: "#16a34a",
  연두: "#84cc16",
  청록: "#0f766e",
  파랑: "#2563eb",
  하늘: "#38bdf8",
  남색: "#1e3a8a",
  보라: "#8b5cf6",
  라벤더: "#a78bfa",
  분홍: "#ec4899",
  핑크: "#ec4899",
  빨강: "#ef4444",
  주황: "#f97316",
  노랑: "#eab308",
  금색: "#d97706",
  갈색: "#92400e",
  흰색: "#f8fafc",
  아이보리: "#f8f1df",
  회색: "#64748b",
  검정: "#111827"
};

const birthTimeOptions = {
  ja: { branch: "자시", label: "자시 (23:30~01:29)" },
  chuk: { branch: "축시", label: "축시 (01:30~03:29)" },
  in: { branch: "인시", label: "인시 (03:30~05:29)" },
  myo: { branch: "묘시", label: "묘시 (05:30~07:29)" },
  jin: { branch: "진시", label: "진시 (07:30~09:29)" },
  sa: { branch: "사시", label: "사시 (09:30~11:29)" },
  o: { branch: "오시", label: "오시 (11:30~13:29)" },
  mi: { branch: "미시", label: "미시 (13:30~15:29)" },
  sin: { branch: "신시", label: "신시 (15:30~17:29)" },
  yu: { branch: "유시", label: "유시 (17:30~19:29)" },
  sul: { branch: "술시", label: "술시 (19:30~21:29)" },
  hae: { branch: "해시", label: "해시 (21:30~23:29)" },
  unknown: { branch: "모름", label: "모름" }
};

birthTimeSelect.addEventListener("invalid", () => {
  birthTimeSelect.setCustomValidity("태어난 시간대를 선택해주세요.");
});

birthTimeSelect.addEventListener("change", () => {
  birthTimeSelect.setCustomValidity("");
});

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

function getBirthTimeInfo(code) {
  return birthTimeOptions[code] ?? birthTimeOptions.unknown;
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getColorHex(colorName) {
  const normalizedName = colorName.replace(/\s/g, "");
  const matchedKey = Object.keys(colorHexMap).find((key) => normalizedName.includes(key));

  if (matchedKey) {
    return colorHexMap[matchedKey];
  }

  return pickBySeed(`color-${colorName}`, luckyColors).hex;
}

function readAiUsage() {
  try {
    return JSON.parse(localStorage.getItem(AI_USAGE_STORAGE_KEY)) ?? {};
  } catch (error) {
    return {};
  }
}

function canUseAiToday() {
  const usage = readAiUsage();
  const todayKey = getTodayKey();
  const count = Number.isInteger(usage.count) ? usage.count : 0;

  return usage.date !== todayKey || count < MAX_DAILY_AI_GENERATIONS;
}

function recordAiUsage() {
  const usage = readAiUsage();
  const todayKey = getTodayKey();
  const count = Number.isInteger(usage.count) ? usage.count : 0;
  const nextCount = usage.date === todayKey ? count + 1 : 1;

  try {
    localStorage.setItem(
      AI_USAGE_STORAGE_KEY,
      JSON.stringify({
        date: todayKey,
        count: nextCount
      })
    );
  } catch (error) {
    // localStorage를 사용할 수 없는 브라우저에서는 제한 기록만 건너뜁니다.
  }
}

function createFortune({ name, birthDate, birthTime, gender }) {
  const todayKey = getTodayKey();
  const seed = `${name}-${birthDate}-${birthTime}-${gender}-${todayKey}`;
  const element = pickBySeed(`${seed}-element`, elementEnergies);
  const color = pickBySeed(`${seed}-color`, luckyColors);

  return {
    todayKey,
    keywords: pickManyBySeed(seed, defaultKeywords, 3),
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

function normalizeAiFortune(aiFortune) {
  return {
    todayKey: getTodayKey(),
    keywords: aiFortune.keywords,
    element: {
      title: aiFortune.energy,
      message: `오늘은 ${aiFortune.energy} 기운이 은근히 두드러져요. 정확한 사주 분석이 아니라 하루를 돌아보는 가벼운 힌트로 참고해 주세요.`
    },
    color: {
      name: aiFortune.luckyColor,
      hex: getColorHex(aiFortune.luckyColor)
    },
    luckyNumber: aiFortune.luckyNumber,
    overall: aiFortune.summary,
    love: aiFortune.love,
    money: aiFortune.money,
    work: aiFortune.work,
    caution: aiFortune.caution,
    advice: aiFortune.message
  };
}

async function fetchAiFortune(userData) {
  const response = await fetch("/api/generate-fortune", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: userData.name,
      birthDate: userData.birthDate,
      birthTime: userData.birthTime,
      birthTimeBranch: userData.birthTimeBranch,
      gender: userData.gender,
      today: getTodayKey()
    })
  });

  if (!response.ok) {
    let errorBody = {};

    try {
      errorBody = await response.json();
    } catch (error) {
      errorBody = { error: "응답 JSON을 읽을 수 없습니다." };
    }

    console.error("[fortune] /api/generate-fortune failed", {
      status: response.status,
      error: errorBody.error
    });

    throw new Error(errorBody.error || "AI fortune request failed");
  }

  return response.json();
}

function buildFortuneText(userData, fortune) {
  return [
    `${userData.name}님의 오늘 운세`,
    `${fortune.todayKey} 기준`,
    `오늘의 키워드: ${fortune.keywords.join(", ")}`,
    `오늘의 오행 기운: ${fortune.element.title}`,
    `행운의 색: ${fortune.color.name}`,
    `행운의 숫자: ${fortune.luckyNumber}`,
    "",
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

function showStatus(message, autoClear = true) {
  clearTimeout(statusTimer);
  aiStatus.textContent = message;

  if (autoClear) {
    statusTimer = setTimeout(() => {
      aiStatus.textContent = "";
    }, 2600);
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

function renderFortune(userData, fortune) {
  document.querySelector("#resultTitle").textContent = `${userData.name}님의 오늘 운세`;
  document.querySelector("#resultMeta").textContent = `${fortune.todayKey} 기준으로 가볍게 살펴본 오늘의 흐름`;
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const birthTimeInfo = getBirthTimeInfo(birthTimeSelect.value);
  const userData = {
    name: document.querySelector("#name").value.trim(),
    birthDate: document.querySelector("#birthDate").value,
    birthTime: birthTimeInfo.label,
    birthTimeBranch: birthTimeInfo.branch,
    gender: document.querySelector("#gender").value
  };

  const originalButtonText = submitButton.textContent;
  let fortune;

  submitButton.disabled = true;
  submitButton.textContent = "AI가 운세를 읽는 중...";
  showStatus("", false);

  try {
    if (!canUseAiToday()) {
      throw new Error("Daily AI limit reached");
    }

    const aiFortune = await fetchAiFortune(userData);
    recordAiUsage();
    fortune = normalizeAiFortune(aiFortune);
  } catch (error) {
    fortune = createFortune(userData);

    if (error.message === "Daily AI limit reached") {
      showStatus("오늘의 AI 운세 생성 횟수를 모두 사용해 기본 운세로 안내드려요.", false);
    } else {
      showStatus("AI 운세를 불러오지 못해 기본 운세로 안내드려요.", false);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }

  renderFortune(userData, fortune);
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

shareButton.addEventListener("click", async () => {
  if (!latestFortuneText) return;

  if (!navigator.share) {
    showStatus("이 브라우저에서는 공유창을 열 수 없어요.", true);
    return;
  }

  try {
    await navigator.share({
      title: "오늘의 사주 운세",
      text: latestFortuneText
    });
    showStatus("공유창을 열었어요.", true);
  } catch (error) {
    if (error.name !== "AbortError") {
      showStatus("공유창을 열지 못했어요. 잠시 후 다시 시도해 주세요.", true);
    }
  }
});

resetButton.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  latestFortuneText = "";
  showStatus("", false);

  // 처음으로 돌아가는 동작을 초보자도 이해하기 쉽도록 폼까지 초기화합니다.
  form.reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
