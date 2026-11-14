# Queue Helper

An [oss!idle](https://oss.idle.rhythmgamers.net) add-on that forecasts what the queue you're playing does to your strain and XP. The successor of [Queue Strain](https://github.com/RaiLTC/queue-strain).

This is the **beta** repository: new versions are tested here first.

Press **Alt+Shift+F** in game, then **Scan**.

## What it sends where

- The game's simulator (`host.api.simulate`), as you, to forecast each play.
- The shared sim cache (`cache.oss.idle.rhythmgamers.net`): looks up plays already simulated, so fewer simulator calls are needed.
- The game's API for your medals, genetics and map plays (Tries).

Nothing else leaves your computer.

## Layout

| Path | What's in it |
| --- | --- |
| `src/index.ts` | What oss!idle calls: `mount`, `unmount`, `canUpdate` |
| `src/QueueHelper.tsx` | The add-on: shortcut, game mode, scanning |
| `src/text.ts` | Every word players see |
| `src/core/` | No DOM: the game's rules, the forecast engine, the scan, game modes |
| `src/core/modes/` | One file per game mode |
| `src/ui/` | The window: state, components and pages, each with its own `.css` beside it; shared styles and design tokens in `styles.css`, joined in `stylesheet.ts` |
| `test/` | Tests for the rules (`node:test`) |

## Developing

```sh
npm install
npm run check   # typecheck, lint, test, build
npm run dev     # rebuild on save
```

Built with the official [oss!idle Addon SDK](https://github.com/oss-idle/addon-sdk), following the [add-on guide](https://oss.idle.rhythmgamers.net/web/docs/addons). The output, `dist/queue-helper.js`, is one unminified ES2022 module.

## Releasing

`npm run release` lints, builds, tags the next version and pushes it; oss!idle then builds that tag. Versions follow the same scheme as Queue Strain, and every release is listed in [CHANGELOG.md](CHANGELOG.md).

## Sources

- [oss!idle](https://github.com/oss-idle/oss-idle) 1.4.3.0: the fatigue, warm-up, XP, Tries and genetics rules, and the simulator
- [oss!idle sim](https://github.com/oss-idle/addon-sim): how the server applies mindblock, fatigue, medals and mods to XP

## License

[AGPL-3.0](LICENSE)
