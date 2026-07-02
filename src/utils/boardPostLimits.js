export const BOARD_POST_TITLE_MAX_LENGTH = 255
export const BOARD_POST_CONTENT_MAX_BYTES = 65_535

const textEncoder = new TextEncoder()
const invisibleTextPattern = /[\u200B-\u200D\uFEFF]/g

export const countCharacters = (value = '') => Array.from(value).length

export const countUtf8Bytes = (value = '') => textEncoder.encode(value).length

export const normalizeBoardPostText = (value = '') => value.replace(invisibleTextPattern, '').trim()

export const isBlankBoardPostText = (value = '') => normalizeBoardPostText(value).length === 0

export const trimToMaxCharacters = (value = '', maxLength) => {
  const characters = Array.from(value)
  return characters.length > maxLength ? characters.slice(0, maxLength).join('') : value
}

export const trimToMaxUtf8Bytes = (value = '', maxBytes) => {
  if (countUtf8Bytes(value) <= maxBytes) return value

  let bytes = 0
  let result = ''
  for (const character of value) {
    const characterBytes = countUtf8Bytes(character)
    if (bytes + characterBytes > maxBytes) break
    bytes += characterBytes
    result += character
  }
  return result
}
