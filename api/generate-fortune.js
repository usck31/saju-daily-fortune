import OpenAI from "openai";

const REQUIRED_FIELDS = [
  "energy",
  "keywords",
  "luckyColor",
  "luckyNumber",
  "summary",
  "love",
  "money",
  "work",
  "caution",
  "message"
];

function logServerError(message, error) {
  console.error(`[generate-fortune] ${message}`, {
    name: error?.name,
    message: error?.message,
    status: error?.status,
    code: error?.code,
    type: error?.type
  });
}

function parseRequestBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  return body;
}

function validateInput(data) {
  const requiredInputFields = ["name", "birthDate", "birthTime", "gender", "today"];
  const missingFields = [];

  for (const field of requiredInputFields) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.error("[generate-fortune] Request fields missing", {
      missingFields,
      receivedFields: Object.keys(data ?? {})
    });
    return `${missingFields.join(", ")} 값이 필요합니다.`;
  }

  return "";
}

function normalizeTextField(value) {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function normalizeFortuneJson(fortune) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in fortune)) {
      throw new Error(`${field} 필드가 없습니다.`);
    }
  }

  const stringFields = ["energy", "luckyColor", "summary", "love", "money", "work", "caution", "message"];
  const normalized = {};

  for (const field of stringFields) {
    const value = normalizeTextField(fortune[field]);

    if (!value) {
      throw new Error(`${field} 필드는 비어 있지 않은 문자열이어야 합니다.`);
    }

    normalized[field] = value;
  }

  if (!Array.isArray(fortune.keywords)) {
    throw new Error("keywords 필드는 배열이어야 합니다.");
  }

  normalized.keywords = [...new Set(fortune.keywords.map(normalizeTextField).filter(Boolean))].slice(0, 3);

  if (normalized.keywords.length < 3) {
    throw new Error("keywords 필드는 비어 있지 않은 문자열 3개 이상을 담아야 합니다.");
  }

  const luckyNumber = Number.parseInt(fortune.luckyNumber, 10);

  if (!Number.isFinite(luckyNumber)) {
    throw new Error("luckyNumber 필드는 숫자여야 합니다.");
  }

  normalized.luckyNumber = Math.min(Math.max(luckyNumber, 1), 99);
  return normalized;
}

function buildPrompt(data) {
  return [
    "아래 사용자의 정보를 참고해서 오늘의 운세를 만들어주세요.",
    "정확한 사주 분석이라고 주장하지 말고, 오락과 자기성찰용 콘텐츠라는 전제를 유지하세요.",
    "건강, 투자, 법률, 중대한 의사결정에 대해 단정적으로 말하지 마세요.",
    "너무 무섭거나 불안하게 말하지 말고, 따뜻하고 재미있는 한국어 톤으로 작성하세요.",
    "반드시 JSON만 반환하세요.",
    "마크다운 코드블록이나 설명 문장은 넣지 마세요.",
    'JSON 형태는 {"energy":"","keywords":["","",""],"luckyColor":"","luckyNumber":7,"summary":"","love":"","money":"","work":"","caution":"","message":""} 입니다.',
    "keywords는 정확히 3개의 짧은 한국어 단어 또는 짧은 구로 작성하세요.",
    "luckyNumber는 1부터 99 사이의 정수로 작성하세요.",
    "특정 주제 하나에 치우치지 말고 총운, 애정운, 금전운, 일/학업운이 모두 자연스럽게 연결되도록 작성하세요.",
    "",
    `이름: ${data.name}`,
    `생년월일: ${data.birthDate}`,
    `태어난 시간: ${data.birthTime}`,
    `성별: ${data.gender}`,
    `오늘 날짜: ${data.today}`
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST 요청만 사용할 수 있습니다." });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("[generate-fortune] OPENAI_API_KEY is missing");
    return res.status(500).json({ error: "OPENAI_API_KEY is missing" });
  }

  let data;

  try {
    data = parseRequestBody(req.body);
  } catch (error) {
    logServerError("Request body JSON parse failed", error);
    return res.status(400).json({ error: "요청 JSON을 읽을 수 없습니다." });
  }

  const inputError = validateInput(data);

  if (inputError) {
    return res.status(400).json({ error: inputError });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "당신은 따뜻하고 재치 있는 한국어 운세 문장을 만드는 도우미입니다. 응답은 반드시 JSON 형식만 사용합니다."
        },
        {
          role: "user",
          content: buildPrompt(data)
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 900
    });

    const outputText = completion.choices?.[0]?.message?.content ?? "";
    let fortune;

    try {
      fortune = JSON.parse(outputText);
    } catch (error) {
      console.error("[generate-fortune] AI response JSON parse failed", {
        message: error?.message,
        outputPreview: outputText.slice(0, 500)
      });
      return res.status(500).json({ error: "AI 응답을 JSON으로 파싱하지 못했습니다." });
    }

    try {
      return res.status(200).json(normalizeFortuneJson(fortune));
    } catch (error) {
      logServerError("AI response validation failed", error);
      return res.status(500).json({ error: `AI 응답 형식이 올바르지 않습니다. ${error.message}` });
    }
  } catch (error) {
    logServerError("OpenAI request failed", error);
    return res.status(500).json({ error: "AI 운세 생성 중 오류가 발생했습니다." });
  }
}
