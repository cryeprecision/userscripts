import { Configuration, BannerPlugin } from 'webpack'
import { generateHeader } from '../plugins/userscript.plugin'
import { Dirent, readdirSync } from 'fs'

const getProjects = (): Dirent[] => {
  return readdirSync('./src/', { withFileTypes: true }).filter(
    (entry) => entry.isDirectory() && entry.name !== 'lib',
  )
}

const config: Configuration = {
  entry: Object.fromEntries(
    getProjects().map((entry) => {
      return [entry.name, `./src/${entry.name}/index.ts`]
    }),
  ),
  target: 'web',
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [
      {
        test: /\.m?ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    jquery: '$',
    dayjs: 'dayjs',
    lodash: '_',
    zod: 'Zod',
  },
  optimization: {
    // https://greasyfork.org/en/help/code-rules
    minimize: false,
  },
  plugins: [new BannerPlugin({ banner: generateHeader, raw: true })],
}

export default config
