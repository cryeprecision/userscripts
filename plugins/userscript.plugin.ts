import { readFileSync } from 'fs'
import { join } from 'path'
import { Chunk } from 'webpack'
import { z } from 'zod'

const UserScriptSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  namespace: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  match: z.string().min(1).array().optional(),
  require: z.string().min(1).array().optional(),
  run_at: z.string().min(1).optional(),
  grant: z.string().min(1).array().optional(),
})
export type UserScript = z.infer<typeof UserScriptSchema>

const PackageJsonSchema = z.object({
  userscripts: z.record(z.string(), UserScriptSchema),
  dependencies: z.record(z.string(), z.string()).optional(),
})

type BannerInfo = {
  hash: string
  chunk: Chunk
  filename: string
}

export const generateHeader = (info: BannerInfo): string => {
  if (!info.chunk.name) {
    throw new Error('[generateHeader] found chunk without name')
  }

  const packageJsonRaw = readFileSync(join(__dirname, '../package.json'), 'utf8')
  const packageJson = PackageJsonSchema.parse(JSON.parse(packageJsonRaw))

  if (!(info.chunk.name in packageJson.userscripts)) {
    throw new Error(
      `[generateHeader] missing userscript entry for ${info.chunk.name} in package.json`,
    )
  }

  const userscript = packageJson.userscripts[info.chunk.name]
  const headers = ['// ==UserScript==']

  headers.push(`// @name ${userscript.name}`)
  headers.push(`// @version ${userscript.version}`)

  if (userscript.namespace) {
    headers.push(`// @namespace ${userscript.namespace}`)
  }

  if (userscript.description) {
    headers.push(`// @description ${userscript.description}`)
  }

  if (userscript.author) {
    headers.push(`// @author ${userscript.author}`)
  }

  if (userscript.icon) {
    headers.push(`// @icon ${userscript.icon}`)
  }

  if (userscript.match) {
    for (const match of userscript.match) {
      headers.push(`// @match ${match}`)
    }
  }

  /**
   * Add userscript header's requires.
   * The package name and version will be obtained from the "dependencies" field,
   * and the jsdelivr link will be generated automatically.
   * You can also set the string template with the parameters "{dependencyName}" and "{dependencyVersion}"
   * in the "require-template" field of the "userscript" object in the "package.json" file.
   */
  if (packageJson.dependencies) {
    const requireTemplate =
      '// @require https://cdn.jsdelivr.net/npm/{dependencyName}@{dependencyVersion}'
    for (const [dependencyName, dependencyVersion] of Object.entries(packageJson.dependencies)) {
      headers.push(
        requireTemplate
          .replace('{dependencyName}', dependencyName)
          .replace('{dependencyVersion}', dependencyVersion.replace(/^[\^~]/, '')),
      )
    }
  }

  if (userscript.require) {
    for (const require of userscript.require) {
      headers.push(`// @require ${require}`)
    }
  }

  if (userscript.run_at) {
    headers.push(`// @run-at ${userscript.run_at}`)
  }

  if (userscript.grant) {
    for (const grant of userscript.grant) {
      headers.push(`// @grant ${grant}`)
    }
  }

  headers.push('// ==/UserScript==\n')
  return headers.join('\n')
}
