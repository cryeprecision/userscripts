export const countInstances = (hay: string, needle: string): number => {
  let count = 0
  for (let i = hay.indexOf(needle); i !== -1 && i < hay.length; i = hay.indexOf(needle, i + 1)) {
    count += 1
  }
  return count
}

export const copyToClipboard = async (str: string) => {
  try {
    await navigator.clipboard.writeText(str)
  } catch (err) {
    alert("couldn't copy text to clipboard")
  }
}

export const countWords = (hay: string, needles: string[]): number => {
  return needles.reduce<number>((acc, next) => acc + (hay.includes(next) ? 1 : 0), 0)
}
