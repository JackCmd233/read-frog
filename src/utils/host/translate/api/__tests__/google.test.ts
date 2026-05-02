import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { googleTranslate } from "../google"

const fetchMock = vi.fn()

describe("googleTranslate", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("uses the public single endpoint without shipping an API key", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      json: vi.fn().mockResolvedValue([
        [
          ["图书馆", "Library", null, null, 10],
        ],
        null,
        "en",
      ]),
      text: vi.fn().mockResolvedValue(""),
    })

    await expect(googleTranslate("Library", "en", "zh")).resolves.toBe("图书馆")

    const [requestUrl, requestInit] = fetchMock.mock.calls[0]
    const url = new URL(String(requestUrl))

    expect(`${url.origin}${url.pathname}`).toBe("https://translate.googleapis.com/translate_a/single")
    expect(url.searchParams.get("client")).toBe("gtx")
    expect(url.searchParams.get("sl")).toBe("en")
    expect(url.searchParams.get("tl")).toBe("zh")
    expect(url.searchParams.get("dt")).toBe("t")
    expect(url.searchParams.get("q")).toBe("Library")
    expect(requestInit).toMatchObject({ method: "GET" })
    expect(requestInit?.headers).toBeUndefined()
    expect(requestInit?.body).toBeUndefined()
  })

  it("joins translated chunks from the single endpoint response", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      json: vi.fn().mockResolvedValue([
        [
          ["图书", "Library", null, null, 10],
          ["馆", null, null, null, 1],
        ],
        null,
        "en",
      ]),
      text: vi.fn().mockResolvedValue(""),
    })

    await expect(googleTranslate("Library", "en", "zh")).resolves.toBe("图书馆")
  })
})
