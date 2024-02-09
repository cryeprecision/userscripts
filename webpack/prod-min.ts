import { merge } from 'webpack-merge'
import base from './base'
import path from 'node:path'
import TerserPlugin from 'terser-webpack-plugin'

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

export default merge(base, {
  mode: 'production',
  cache: {
    type: 'filesystem',
    name: 'prod',
  },
  output: {
    path: path.resolve('.', 'userscripts'),
    filename: '[name].prod-min.user.js',
  },
  optimization: {
    // https://greasyfork.org/en/help/code-rules
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.terserMinify,
        terserOptions: {
          format: { comments: isUserscriptComment },
          compress: {
            toplevel: true,
            unsafe: true,
          },
          mangle: { toplevel: true },
        },
        extractComments: false,
      }),
    ],
  },
  watchOptions: { ignored: /node_modules/ },
})
