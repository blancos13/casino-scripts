export function getEmptyArr(length, def) {
  const arr = []

  for(let i = 0; i < length; i++) {
    arr.push({ ...def, index: i })
  }

  return arr
}