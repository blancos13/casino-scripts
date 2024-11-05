import { getCookie } from './getCookie'

export function getMeta(payload) {
  const lang = getCookie('lang')

  if (!payload[lang] || !payload[lang].length) {
    return {
      title: 'Бельрив',
      meta: [],
      link: []
    }
  }

  const title = payload[lang].find(item => item.key === 'title')

  return {
    title: title ? title.content : 'Belriv',
    meta: payload[lang].filter(item => item.key !== 'title').map(item => ({ name: item.key, content: item.content })),
    link: []
  }
}