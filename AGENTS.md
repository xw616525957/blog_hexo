# AGENTS.md

## Cursor Cloud specific instructions

This is a **Hexo static blog** project. The Hexo project root is in the `blog/` subdirectory (not the repo root).

### Services

| Service | Command | Notes |
|---------|---------|-------|
| Dev server | `cd blog && npx hexo server` | Serves at `http://localhost:4000` with live-reload |
| Build | `cd blog && npx hexo generate` | Outputs static files to `blog/public/` |

### Quick reference

- **Create a new post:** `cd blog && npx hexo new "Post Title"`
- **Clean generated files:** `cd blog && npx hexo clean`
- Standard Hexo commands documented at https://hexo.io/docs/commands.html

### Caveats

- All `npm` and `hexo` commands must be run from `blog/`, not the repo root.
- Node.js deprecation warnings (e.g. `util.isDate`, circular dependency property access) are expected with this older Hexo 3.x version and can be safely ignored.
- There is no linter, test suite, or CI configured in this repository.
- The blog has no deployment target configured (`_config.yml` deploy type is empty).
