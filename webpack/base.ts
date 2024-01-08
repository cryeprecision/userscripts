import TerserPlugin from 'terser-webpack-plugin'
import { Configuration, BannerPlugin } from 'webpack'
import { generateHeader } from '../plugins/userscript.plugin'
import { Dirent, readdirSync } from 'fs'

const getProjects = (): Dirent[] => {
  return readdirSync('./src/', { withFileTypes: true }).filter(
    (entry) => entry.isDirectory() && entry.name !== 'lib',
  )
}

type Comment = {
  value: string
  type: 'comment1' | 'comment2' | 'comment3' | 'comment4'
  pos: number
  line: number
  col: number
}

// Used to remove all comments except the userscript metadata comments
const isUserscriptComment = (_node: unknown, comment: Comment): boolean => {
  return (
    comment.type === 'comment1' && /^\s(==UserScript==|==\/UserScript==|@\w+)/.test(comment.value)
  )
}

const config: Configuration = {
  entry: Object.fromEntries(
    getProjects().map((entry) => [entry.name, `./src/${entry.name}/index.ts`]),
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
  },
  optimization: {
    // https://greasyfork.org/en/help/code-rules
    minimize: false,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.terserMinify,
        terserOptions: {
          format: { comments: isUserscriptComment },
          compress: true,
          mangle: true,
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [new BannerPlugin({ banner: generateHeader, raw: true })],
}

export default config
