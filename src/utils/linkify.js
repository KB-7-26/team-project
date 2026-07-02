const URL_PATTERN = /https?:\/\/[^\s<]+/g
const TRAILING_PUNCTUATION = /[.,!?;:'")\]]+$/

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 텍스트를 이스케이프한 뒤 URL만 골라 <a> 태그로 치환합니다.
export function linkify(text) {
  if (!text) return ''
  return escapeHtml(text).replace(URL_PATTERN, (match) => {
    const trailing = match.match(TRAILING_PUNCTUATION)?.[0] ?? ''
    const url = trailing ? match.slice(0, -trailing.length) : match
    if (!url) return match
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline break-all">${url}</a>${trailing}`
  })
}
