# Building Truiter's script.js

`script.js` is generated: it is [Control Panel for Twitter](https://github.com/insin/control-panel-for-twitter)'s
`script.js` with a fixed configuration folded in and the unused code removed.
Everything else in the package (`content.js`, `nav.js`, `styles.css`, `manifest.json`) is hand-written.

Requirements: Node 25 (tested with 25.6.1), npm, Python 3, git, and network access to clone the upstream repository.

```sh
cd tools
npm ci          # installs the pinned @babel/parser, @babel/traverse, @babel/types and recast
sh update.sh    # clones upstream at the commit in tools/upstream-commit and regenerates ../script.js
```

- `tools/upstream-commit`: the upstream commit the shipped `script.js` was generated from.
- `tools/pre.py`: text-level edits to the upstream file (full-width layout, page classes on `<body>`).
- `tools/prune.mjs`: the fixed configuration (`FOLD`) and the dead-code removal (Babel + recast).

The output is deterministic: the same commit and lockfile produce a byte-identical `script.js`.
To check: run `sh update.sh` and `git diff --stat script.js` (or `diff` against the packaged file).

*Em português: `script.js` é gerado pelo `tools/update.sh` a partir do commit em `tools/upstream-commit`; o resto do pacote é escrito à mão.*
