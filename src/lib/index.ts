import { z } from 'zod'

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

export const store = <T>(key: string, value: T): void => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const load = <T extends z.ZodTypeAny>(schema: T, key: string): z.infer<T> | null => {
  const str = window.localStorage.getItem(key)
  if (str === null) return null
  const data = JSON.parse(str)

  const result = schema.safeParse(data)
  if (!result.success) {
    console.error(`local storage key ${key} doesn't match schema`, result.error)
    return null
  }

  return result.data
}

export const loadOrStoreDefault = <T extends z.ZodTypeAny>(
  schema: T,
  key: string,
  def: z.infer<T>,
): z.infer<T> => {
  const loaded = load(schema, key)
  if (loaded === null) {
    store(key, def)
    return def
  }
  return loaded
}
