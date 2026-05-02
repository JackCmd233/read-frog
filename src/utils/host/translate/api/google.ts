import { attachRequestErrorMeta } from "@/utils/request/retry-policy"

const GOOGLE_TRANSLATE_SINGLE_URL = "https://translate.googleapis.com/translate_a/single"
const GOOGLE_TRANSLATE_SINGLE_CLIENT = "gtx"

export async function googleTranslate(
  sourceText: string,
  fromLang: string,
  toLang: string,
): Promise<string> {
  const query = new URLSearchParams({
    client: GOOGLE_TRANSLATE_SINGLE_CLIENT,
    sl: fromLang,
    tl: toLang,
    dt: "t",
    strip: "1",
    nonced: "1",
    q: sourceText,
  })

  const resp = await fetch(
    `${GOOGLE_TRANSLATE_SINGLE_URL}?${query.toString()}`,
    {
      method: "GET",
    },
  ).catch((error) => {
    throw attachRequestErrorMeta(
      new Error(`Network error during translation: ${error.message}`),
      { kind: "network", isRetryable: true },
    )
  })

  if (!resp.ok) {
    const errorText = await resp
      .text()
      .catch(() => "Unable to read error response")
    throw attachRequestErrorMeta(
      new Error(`Translation request failed: ${resp.status} ${resp.statusText}${
        errorText ? ` - ${errorText}` : ""
      }`),
      {
        statusCode: resp.status,
        responseHeaders: resp.headers,
      },
    )
  }

  try {
    const result = await resp.json()

    if (!Array.isArray(result) || !Array.isArray(result[0])) {
      throw new TypeError("Unexpected response format from translation API")
    }

    const translatedText = result[0]
      .filter(Array.isArray)
      .map(chunk => chunk[0])
      .filter((chunk): chunk is string => typeof chunk === "string" && chunk.length > 0)
      .join("")

    if (translatedText === "") {
      throw new TypeError("Unexpected response format from translation API")
    }

    return translatedText
  }
  catch (error) {
    throw new Error(
      `Failed to parse translation response: ${(error as Error).message}`,
    )
  }
}
