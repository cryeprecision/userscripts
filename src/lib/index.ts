export const countInstances = (hay: string, needle: string): number => {
  let count = 0
  for (let i = hay.indexOf(needle); i !== -1 && i < hay.length; i = hay.indexOf(needle, i + 1)) {
    count += 1
  }
  return count
}

export {}
