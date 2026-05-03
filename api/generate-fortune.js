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

const fortuneSchema = {
  type: "object",
  properties: {
    energy: { type: "string" },
    keywords: {
      type: "array",
      items: { type: "string" }
    },
    luckyColor: { type: "string" },
    luckyNumber: { type: "number" },
    summary: { type: "string" },
    love: { type: "string" },
    money: { type: "string" },
    work: { type: "string" },
    caution: { type: "string" },
    message: { type: "string" }
  },
  required: REQUIRED_FIELDS,
  additionalProperties: false
};

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

  for (const field of requiredInputFields) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      return `${field} 값이 필요합니다.`;
    }
  }

  return "";
}

function validateFortuneJson(fortune) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in fortune)) {
      return `${field} 필드가 없습니다.`;
    }
  }

  const stringFields = ["energy", "luckyColor", "summary", "love", "money", "work", "caution", "message"];

  for (const field of stringFields) {
    if (typeof fortune[field] !== "string" || fortune[field].trim() === "") {
      return `${field} 필드는 비어 있지 않은 문자열이어야 합니다.`;
    }
  }

  if (!Array.isArray(fortune.keywords) || fortune.keywords.length !== 3) {
    return "keywords 필드는 문자열 3개를 담은 배열이어야 합니다.";
  }

  if (!fortune.keywords.every((keyword) => typeof keyword === "string" && keyword.trim() !== "")) {
    return "keywords 배열에는 비어 있지 않은 문자열만 들어갈 수 있습니다.";
  }

  if (!Number.isInteger(fortune.luckyNumber)) {
    return "luckyNumber 필드는 정수여야 합니다.";
  }

  return "";
}

function getOutputText(response) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  const firstTextPart = response.output
    ?.flatMap((item) => item.content ?? [])
    .find((part) => typeof part.text === "string");

  return firstTextPart?.text ?? "";
}

function buildPrompt(data) {
  return [
    "아래 사용자의 정보를 참고해서 오늘의 운세를 만들어주세요.",
    "정확한 사주 분석이라고 주장하지 말고, 오락과 자기성찰용 콘텐츠라는 전제를 유지하세요.",
    "건강, 투자, 법률, 중대한 의사결정에 대해 단정적으로 말하지 마세요.",
    "너무 무섭거나 불안하게 말하지 말고, 따뜻하고 재미있는 한국어 톤으로 작성하세요.",
    "반드시 JSON만 반환하세요.",
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
    return res.status(500).json({ error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다." });
  }

  let data;

  try {
    data = parseRequestBody(req.body);
  } catch (error) {
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

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "당신은 따뜻하고 재치 있는 한국어 운세 문장을 만드는 도우미입니다. 응답은 반드시 JSON 형식만 사용합니다."
        },
        {
          role: "user",
          content: buildPrompt(data)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "daily_fortune",
          strict: true,
          schema: fortuneSchema
        }
      },
      temperature: 0.8,
      max_output_tokens: 900
    });

    const outputText = getOutputText(response);
    let fortune;

    try {
      fortune = JSON.parse(outputText);
    } catch (error) {
      return res.status(500).json({ error: "AI 응답을 JSON으로 파싱하지 못했습니다." });
    }

    const fortuneError = validateFortuneJson(fortune);

    if (fortuneError) {
      return res.status(500).json({ error: `AI 응답 형식이 올바르지 않습니다. ${fortuneError}` });
    }

    return res.status(200).json(fortune);
  } catch (error) {
    return res.status(500).json({ error: "AI 운세 생성 중 오류가 발생했습니다." });
  }
}
