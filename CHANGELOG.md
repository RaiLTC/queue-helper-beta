# Changelog

All notable changes to Queue Helper. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.08] - 2026-11-14

### Changed

- The window hides completely while the game's options or Add-ons page is open

## [0.1.07] - 2026-11-14

### Fixed

- Near either end of the bar, the forecast time sits beside its needle instead of running off the edge

## [0.1.06] - 2026-11-14

### Changed

- The bar sits in the middle of its card, with the forecast needle's time right under the needle

### Fixed

- The window didn't fade at all; it fades again when the mouse leaves, and only holds off after a page change until the mouse has been back in

## [0.1.05] - 2026-11-14

### Changed

- The bar's forecast needle is a faint solid line, with its time under it

### Fixed

- The window faded right after changing page, when it shrank away from the mouse
- Hovering Strain over time resized the gauge and bar cards

## [0.1.04] - 2026-11-14

### Added

- Strain display: a bar instead of the gauge, with the stage over its section
- Proportions: Even, Balanced or To scale, so Peak can grow with your Stamina upgrades
- osu! pink as an accent colour

### Changed

- The selected option in settings shows the accent colour
- The window only starts fading once your mouse has been in it and left, not right after opening it or changing page
- A slightly smaller stage name, so it fits inside the gauge

## [0.1.03] - 2026-11-14

### Added

- Settings: forecast, appearance and window options, saved as you change them, with Reset and Undo
- What's new, with a dot on its icon until you've seen the latest version
- Accent colour: any stage colour (Peak by default), your current stage, or your own
- The window fades while the mouse is away, lets clicks through over game menus, and shows the chat through it
- Rescans by itself when you edit the queue

### Changed

- The gauge shows your stage first, with the % under it; staying in Peak reads "Stable for 6 hours"
- Stage colours match the game's bar: Fatigued and the XP Penalty are purple
- "Past Peak" is now "Pushing", as in the game
- The scan's progress bar fills through the strain colours

## [0.1.02] - 2026-11-14

### Changed

- The gauge has the planned size, and its ghost needle is dashed again
- Taller Peak and XP Penalty bands on the graph
- The strain line is smoothed (averaged over a few minutes) instead of zig-zagging with every play

## [0.1.01] - 2026-11-14

### Changed

- Matches the planned design: map names show the title only (the full name is in the tooltip), XP always shows one decimal (6.0K), the side menu runs the full height, and the planned icons

### Fixed

- The ghost needle's time was cut off at the top of the gauge

## [0.1.0] - 2026-11-14

### Added

- Overview: a warm-up gauge with your stage, where you'll be at the end of the look-ahead, and when you reach Peak or the XP Penalty
- Strain over time graph with the Peak and XP Penalty bands; hover it to move the gauge's ghost needle, in 10-minute steps
- Queue Forecast: every play ahead with its XP, strain, length and the bar after it, with the game's arrows
- Scan with a look-ahead of 1 to 24 hours, progress and Stop
- Game modes: 4K forecasts; 7K is recognised and says forecasts aren't available yet
