# Userscript Collection

Based on [github.com/pboymt/userscript-typescript-template](https://github.com/pboymt/userscript-typescript-template).

## How it Works

- Each directory in `./src/<name>` that is *not* `./src/lib` represents a independent script that
  uses the entrypoint `./src/<name>/index.ts` and will be compiled to
  `./userscripts/<name>.<prod|dev>.user.js`.
- Dependencies are external and should be marked as such in `./webpack/base.ts` to avoid the
  dependency being inlined into the compiled userscript. Dependencies (not `devDependencies`) from
  the `./package.json` will be appended to the userscript header in
  `./plugins/userscript.plugin.ts`.

## To Do

- [ ] Find a way to embed the userscript header in `./src/<name>/index.ts` e.g. adding a
      `export const userscriptConfig: UserscriptConfig = { ... }` to not clutter the
      `./package.json` with them.
