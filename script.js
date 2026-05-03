// 오늘의 사주 운세 - 첫 번째 토이 프로젝트 버전
// 실제 만세력 계산이 아니라, 입력값과 오늘 날짜를 조합해 매일 달라지는 운세를 보여줍니다.

const form = document.querySelector("#fortuneForm");
const resultSection = document.querySelector("#result");
const resetButton = document.querySelector("#resetButton");

const fortunes = {
  overall: [
    "오늘은 흐름을 억지로 바꾸기보다 자연스럽게 따라갈 때 좋은 결과가 생기는 날입니다.",
    "작은 선택 하나가 기분 좋은 변화를 만들 수 있습니다. 평소 미뤄둔 일을 가볍게 시작해보세요.",
    "주변의 말에 흔들리기보다 내 기준을 차분히 세우면 안정적인 하루가 됩니다.",
    "새로운 아이디어가 떠오르기 쉬운 날입니다. 기록해두면 나중에 쓸모가 있습니다."
  ],
  love: [
    "솔직하지만 부드러운 표현이 관계를 더 편안하게 만들어줍니다.",
    "상대의 반응을 기다리기보다 먼저 따뜻한 말을 건네면 좋은 기운이 들어옵니다.",
    "오해가 생기기 쉬운 날이니 짧은 메시지보다 직접적인 대화가 좋습니다.",
    "가까운 사람에게 고마움을 표현하면 관계운이 부드럽게 풀립니다."
  ],
  money: [
    "큰 지출보다는 작은 소비를 점검하기 좋은 날입니다.",
    "충동구매만 피하면 금전 흐름은 무난합니다. 비교하고 결정하세요.",
    "새로운 수입 기회보다 기존 자원을 잘 관리하는 데 운이 따릅니다.",
    "돈과 관련된 약속은 기록으로 남겨두는 것이 좋습니다."
  ],
  work: [
    "집중력이 천천히 올라오는 날입니다. 쉬운 일부터 처리하면 속도가 붙습니다.",
    "혼자 해결하려 하기보다 주변에 질문하면 의외로 빠른 답을 얻을 수 있습니다.",
    "디테일을 챙길수록 좋은 평가를 받을 수 있습니다.",
    "새로운 업무나 공부를 시작하기보다 기존 내용을 정리하기 좋은 날입니다."
  ],
  advice: [
    "오늘의 행운 포인트는 ‘천천히, 그러나 분명하게’입니다.",
    "말을 줄이고 관찰을 늘리면 놓쳤던 기회가 보입니다.",
    "기분이 흐트러질 때는 따뜻한 음료 한 잔과 짧은 산책이 도움이 됩니다.",
    "완벽하게 하려는 마음보다 끝까지 해보는 태도가 행운을 부릅니다."
  ]
};

const elements = ["목", "화", "토", "금", "수"];

function getStableIndex(seed, length) {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }

  return hash % length;
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getElementMessage(element) {
  const messages = {
    목: "성장과 시작의 기운이 강합니다. 작은 시도를 해보기 좋은 날이에요.",
    화: "표현과 열정의 기운이 살아납니다. 자신감을 조금 더 드러내도 좋습니다.",
    토: "안정과 정리의 기운이 중심을 잡아줍니다. 흐트러진 것을 정돈해보세요.",
    금: "판단과 결실의 기운이 들어옵니다. 중요한 선택은 차분히 비교해보세요.",
    수: "지혜와 유연함의 기운이 돕습니다. 대화와 정보 수집에 유리합니다."
  };

  return messages[element];
}

function createFortune({ name, birthDate, birthTime, gender }) {
  const todayKey = getTodayKey();
  const seed = `${name}-${birthDate}-${birthTime}-${gender}-${todayKey}`;
  const element = elements[getStableIndex(seed, elements.length)];

  return {
    element,
    overall: `${getElementMessage(element)} ${fortunes.overall[getStableIndex(seed + "overall", fortunes.overall.length)]}`,
    love: fortunes.love[getStableIndex(seed + "love", fortunes.love.length)],
    money: fortunes.money[getStableIndex(seed + "money", fortunes.money.length)],
    work: fortunes.work[getStableIndex(seed + "work", fortunes.work.length)],
    advice: fortunes.advice[getStableIndex(seed + "advice", fortunes.advice.length)]
  };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const userData = {
    name: document.querySelector("#name").value.trim(),
    birthDate: document.querySelector("#birthDate").value,
    birthTime: document.querySelector("#birthTime").value,
    gender: document.querySelector("#gender").value
  };

  const fortune = createFortune(userData);

  document.querySelector("#resultTitle").textContent = `${userData.name}님의 오늘 운세`;
  document.querySelector("#resultMeta").textContent = `${userData.birthDate} · ${userData.birthTime} · 오늘의 오행 기운: ${fortune.element}`;
  document.querySelector("#overall").textContent = fortune.overall;
  document.querySelector("#love").textContent = fortune.love;
  document.querySelector("#money").textContent = fortune.money;
  document.querySelector("#work").textContent = fortune.work;
  document.querySelector("#advice").textContent = fortune.advice;

  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

resetButton.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  form.reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
