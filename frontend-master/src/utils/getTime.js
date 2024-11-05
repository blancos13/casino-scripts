export function getTime(date) {
  const data = new Date(date)
  const format = (payload) => payload < 10 ? '0' + payload : payload

  return `${format(data.getHours())}:${format(data.getMinutes())}:${format(data.getSeconds())}`
}