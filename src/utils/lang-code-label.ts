import type { LangCodeISO6393 } from "@read-frog/definitions"
import { LANG_CODE_TO_EN_NAME, LANG_CODE_TO_LOCALE_NAME } from "@read-frog/definitions"

export function langCodeLabel(langCode: LangCodeISO6393): string {
  return `${LANG_CODE_TO_EN_NAME[langCode]} (${LANG_CODE_TO_LOCALE_NAME[langCode]})`
}
