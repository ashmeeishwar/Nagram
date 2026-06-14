import { GLYPHS } from './devanagariGlyphs'
import { CENTER, GOLD, pt, seedOfLife, polygon, starPath } from './sigilGeometry'

// Main Nagram logo sigil — sacred-geometry line work with real Devanagari
// letterforms at the cardinal points (ना · ग · र · म) and ॐ / अ as accents.
// Fully self-contained SVG: single accent colour, transparent background,
// works in light and dark mode.

const seed = seedOfLife(26)

// Devanagari placements on a ring of radius 90 (font units → px via scale).
const ring = 90
const glyphPlacements = [
  { g: GLYPHS.na, angle: -90, size: 50 }, // ना — top
  { g: GLYPHS.ga, angle: -30, size: 46 }, // ग — upper right
  { g: GLYPHS.ra, angle: 30, size: 46 }, // र — lower right
  { g: GLYPHS.ma, angle: 90, size: 46 }, // म — bottom
  { g: GLYPHS.a, angle: 180, size: 44 }, // अ — left accent
]

export default function LogoSigil({ size = 220, color = GOLD, title = 'Nagram', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      {...rest}
    >
      <title>{title}</title>
      <g
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* Concentric mandala rings */}
        <circle cx={CENTER} cy={CENTER} r="114" opacity="0.55" />
        <circle cx={CENTER} cy={CENTER} r="108" strokeWidth="0.6" opacity="0.4" />
        <circle cx={CENTER} cy={CENTER} r="96" strokeDasharray="1 5" opacity="0.7" />

        {/* 12-fold radial ticks for radial symmetry */}
        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = pt(i * 30, 99)
          const [x2, y2] = pt(i * 30, 107)
          return <line key={`tick${i}`} x1={x1} y1={y1} x2={x2} y2={y2} opacity="0.6" />
        })}

        {/* Seed of Life — interlocking circles */}
        {seed.map((c, i) => (
          <circle key={`seed${i}`} cx={c.cx} cy={c.cy} r={c.r} strokeWidth="0.8" opacity="0.8" />
        ))}

        {/* Nested triangles (hexagram) */}
        <path d={polygon(3, 78, -90)} opacity="0.85" />
        <path d={polygon(3, 78, 90)} opacity="0.85" />

        {/* Inner pentagram */}
        <path d={starPath(5, 40, 2, -90)} strokeWidth="0.7" opacity="0.7" />

        {/* Central rings cradling the ॐ */}
        <circle cx={CENTER} cy={CENTER} r="34" strokeWidth="0.7" opacity="0.6" />
      </g>

      {/* Devanagari letterforms — filled glyph outlines */}
      <g fill={color} stroke="none">
        {glyphPlacements.map(({ g, angle, size: gs }, i) => {
          const [x, y] = pt(angle, ring)
          return (
            <path
              key={`glyph${i}`}
              d={g.d}
              transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${gs / 1000})`}
            />
          )
        })}
        {/* ॐ — accent glyph at the centre */}
        <path d={GLYPHS.om.d} transform={`translate(${CENTER} ${CENTER}) scale(${52 / 1000})`} />
      </g>
    </svg>
  )
}
