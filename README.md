# iOS Chrome Transparency

Live: https://davebsoderberg.github.io/ios-chrome-transparency/

A test rig for iOS Safari's opaque-chrome heuristic. WebKit's
`fixedContainerEdges` hit-tests one point per viewport edge — 4px in from the
edge, horizontally centered — walks up to the nearest `fixed`/`sticky`
ancestor, and paints the status bar / toolbar opaque when that element is
roughly full viewport width (≥ 90%). This page turns each condition into a
toggle so the hypothesis can be falsified on a real device:

- **gap** — 5px / 4px / 0px from the edge (the probe sits exactly 4px in)
- **width** — 100% / 85% centered / 48% left-aligned
- **depth** — bars as direct children of the track vs 4 wrappers deep
- **decoy** — a tiny sticky chip pinned over just the probe point

The control panel predicts the outcome for the current combo; if Safari ever
disagrees, the hypothesis is wrong. Config is mirrored into URL params
(`?gap=4&width=85&depth=4&decoy=on`), so a reload restores the chosen state —
the only reliable reset once the opaque chrome gets stuck.

Plain HTML/CSS/JS, no build step. Open `index.html` or the live URL on iPhone
Safari; the chrome behavior only shows there (desktop browsers and CodePen's
preview iframe don't have the dynamic toolbar).
