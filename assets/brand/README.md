# Band With Me app icon

`AppIcon.icon` is an editable Apple Icon Composer document: gold saxophone,
coral electric guitar, pearl mint drum kit and three fading band members on petrol.

The instrument shapes use actual downloaded **Google Noto Emoji SVG paths**,
licensed under Apache-2.0. Their contour coordinates are preserved, with uniform
scaling and rotation instead of redrawing or stretching. The saxophone is mirrored.
Original SVGs, attribution and the full license are in [sources/noto](sources/noto/README.md).
The drum kit and band geometry are authored for this composition.

## Composition and simplification

The selected initial concept remains the visual reference: a compact band behind
three instruments, with the drum lower and in front. Oval cymbals replace the
pointed cymbal shapes. The saxophone sits far enough left to expose its bell.
The shoulders form one continuous silhouette, avoiding overlapping alpha seams,
and fade to zero opacity at the bottom.

The instrument source paths retain their characteristic neck, body, bell and
cutaways. Keys, strings, frets, tuners, controls, pickguard, painted shadows and
highlights are removed. Amber `#FFC124`, coral `#FF7854`, mint and petrol keep the
original color roles. No fonts, SF Symbols or raster images are embedded.

## Layers and material

Six 1024 × 1024 SVGs are individually editable in four groups, front to back:

1. Drum kit: `kick-drum.svg` and `cymbals.svg`.
2. Saxophone: `saxophone.svg`.
3. Electric guitar: `guitar.svg`.
4. Band: `band-heads.svg` and `band.svg`.

Apple's asset compiler permits at most four visible groups. The background is
an Icon Composer fill. Apple renders the mask, glass, specular highlights and
shadows. Inside-aligned specular highlights avoid a heavy dark outline.
Shoulder glass is disabled so their bottom edge fades rather than catching light.
Additional refractivity is omitted because the 27.2 renderer produced rectangular
seams around overlapping artwork in an earlier evaluation.

The background uses a `#177975` to `#0B3438` gradient, with `#141F1F` for Dark.
System tint controls Tinted appearances. Glass differs between Apple design
generations 26 and 27; a generated concept image is not proof of the shipped look.

## Open and preview

```sh
open -a '/Applications/Xcode.app/Contents/Applications/Icon Composer.app' assets/brand/AppIcon.icon
```

Use the executable bundled with Icon Composer, not `xcrun ictool`:

```sh
ICON_COMPOSER_TOOL='/Applications/Xcode.app/Contents/Applications/Icon Composer.app/Contents/Executables/ictool'
"$ICON_COMPOSER_TOOL" "$PWD/assets/brand/AppIcon.icon" \
  --export-image --output-file /tmp/band-with-me-icon.png \
  --platform iOS --rendition Default --width 512 --height 512 \
  --scale 1 --design-generation 27
```

Other renditions: `Dark`, `ClearLight`, `ClearDark`, `TintedLight`, `TintedDark`.
Use `--design-generation 26` to compare the previous renderer.

## Validation and integration scope

Checked: SVG XML and references, exact preservation of selected upstream path
coordinates, original source hashes, all six native appearance exports, small
exports at 60, 40, 32 and 16 pixels, and `actool` compilation for iOS Simulator.
At 16 pixels individual instrument details are not legible. Dark system tints can
reduce contrast. The actual native exports are the review artifact.

`app.json` now sets `ios.icon` to `./assets/brand/AppIcon.icon`. The iOS bundle ID
and signing team match the existing physical-device development client, so a
clean prebuild regenerates the same app identity.

Integration verified with a clean Expo 58 iOS prebuild (clean is the default;
`--no-clean` opts out), CocoaPods installation, a signed Xcode Debug device build,
and an in-place install on the connected iPhone 17 Pro running iOS 27.2.1. The
generated native icon matches all source files byte for byte, and the built
application declares `AppIcon` as its primary icon. Installation preserves the
existing app data. Android and web icon configuration is outside this iOS change.

Design guidance: [Impeccable](../../.agents/skills/impeccable/SKILL.md),
[Apple app icons](https://developer.apple.com/design/human-interface-guidelines/app-icons/),
[Icon Composer](https://developer.apple.com/icon-composer/).
