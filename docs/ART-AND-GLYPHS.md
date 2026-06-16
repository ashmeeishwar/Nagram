# Art & Glyphs

How the sigils and the embedded Devanagari letterforms are produced. The goal:
**fully self-contained SVG that renders identically everywhere and works offline**
— so the Devanagari is shipped as `<path>` outlines, not as a font.

## Geometry

All art uses a `240×240` viewBox centered on `(120,120)`, single gold `#c9a23f`
stroke, transparent background. Helpers in `src/components/sigilGeometry.js`:

- `pt(angleDeg, radius)` — point on a circle (0° = +x, clockwise / SVG y-down).
- `seedOfLife(radius)` — center circle + 6 circles whose centers sit on it.
- `polygon(sides, radius, start)` — regular polygon path (two of these at
  `start=-90` and `90` make the hexagram).
- `starPath(points, radius, step, start)` — star polygon (pentagram = 5/step 2).

Layers, outside-in: concentric mandala rings + 12 radial ticks → seed of life →
hexagram → inner pentagram → central ring → Devanagari glyphs.

Glyph placement (LogoSigil): on a ring of radius 90 — `ना` at −90° (top),
`ग` −30°, `र` 30°, `म` 90°, `अ` 180°; `ॐ` at the center. Each is drawn with
`transform="translate(x y) scale(size/1000)"`.

## Devanagari glyph extraction recipe

Glyphs needed: न (0x0928), ा matra (0x093E), ग (0x0917), र (0x0930), म (0x092E),
अ (0x0905), ॐ (0x0950). `ना` is composed as न + ा.

```bash
pip install fonttools brotli
# Noto Sans Devanagari (variable TTF), SIL OFL 1.1
curl -L -o noto.ttf \
  "https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf"
```

```python
# 1) Instantiate the variable font to a static weight for clean outlines
from fontTools import ttLib
from fontTools.varLib.instancer import instantiateVariableFont
f = ttLib.TTFont("noto.ttf")
instantiateVariableFont(f, {"wght": 500, "wdth": 100}, inplace=True)
f.save("noto-static.ttf")

# 2) Extract each glyph as a centered, Y-flipped SVG path (1000-unit em).
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
g = ttLib.TTFont("noto-static.ttf"); gs = g.getGlyphSet()
cmap = g.getBestCmap(); hmtx = g["hmtx"]

def draw(pen, uni, xoff=0):
    name = cmap[uni]
    gs[name].draw(TransformPen(pen, (1,0,0,1,xoff,0)))
    return hmtx[name][0]   # advance width

def centered_path(unicodes):           # list of codepoints drawn in sequence
    b = BoundsPen(gs); x = 0
    for u in unicodes: x += draw(b, u, x)
    xmin,ymin,xmax,ymax = b.bounds
    cx,cy = (xmin+xmax)/2, (ymin+ymax)/2
    p = SVGPathPen(gs); x = 0
    for u in unicodes:                  # flip Y (d=-1) and center (e=-cx, f=cy)
        x += draw(TransformPen(p, (1,0,0,-1,-cx,cy)), u, x)
    return p.getCommands()

paths = {
  "na": centered_path([0x0928, 0x093E]),   # न + ा
  "ga": centered_path([0x0917]),
  "ra": centered_path([0x0930]),
  "ma": centered_path([0x092E]),
  "a":  centered_path([0x0905]),
  "om": centered_path([0x0950]),
}
print(paths)   # paste into src/components/devanagariGlyphs.js
```

The result is hard-coded into `src/components/devanagariGlyphs.js` as
`GLYPHS = { na:{d,…}, ga:{…}, … }`. Because the paths are centered on the origin
in 1000-unit em space with Y already flipped, components just place them with
`translate(x y) scale(px/1000)`.

> Keep `licenses/OFL.txt` in the repo (Noto Sans Devanagari is SIL OFL 1.1).
> The outlines are a permitted derivative; ship the license.

## Icons

`scripts/generate-icons.mjs` rebuilds the AppIcon as a plain SVG string (reusing
`devanagariGlyphs.js` + `sigilGeometry.js`) and rasterizes with `sharp`:
`pwa-192x192.png`, `pwa-512x512.png` (dark bg), `maskable-512x512.png` (dark bg +
18% safe-zone padding), `apple-touch-icon.png`, and the transparent
`public/icon.svg` favicon. It runs automatically as the npm **`prebuild`** hook,
so the PNGs don't need to be committed — a fresh `npm run build` regenerates them.
