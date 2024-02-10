# Userscript Collection

Based on [github.com/pboymt/userscript-typescript-template](https://github.com/pboymt/userscript-typescript-template).

## How to Use

Check [`docs`](docs/README.md)

## How it Works

### Scripts

- Each directory in `src/<name>` that is **not** `src/lib` represents an independent script.
- In `userscripts.json`, each script must have an entry with the key `<name>`
- Each script uses the **entrypoint** `src/<name>/index.ts`.
- Each script will be **compiled to** `userscripts/<name>.<mode>.user.js`.

### Dependencies

- In `package.json`, each `dependencies`-entry must have a corresponding `dependenciesJsDelivr`-entry
- Dependencies must be external have to be marked as such in `webpack/base.ts`.
  - This avoids the dependency being inlined into the compiled userscript.

## To Do

- [ ] Find a way to embed the userscript header in `./src/<name>/index.ts` e.g. adding a
      `export const userscriptConfig: UserscriptConfig = { ... }` to not clutter the
      `./package.json` with them.
