import { GLYPHS } from './devanagariGlyphs'
import { CENTER, GOLD, pt, seedOfLife, polygon, starPath } from './sigilGeometry'

// Faint background watermark sigil — an intricate, low-opacity mandala meant to
// sit behind the app content. Decorative only (aria-hidden).

const seed = seedOfLife(30)

export default function WatermarkSigil({ size = 680, color = GOLD, opacity = 0.05, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ opacity }}
      {...rest}
    >
      <g stroke={color} strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round">
        {/* Concentric rings */}
        <circle cx={CENTER} cy={CENTER} r="118" />
        <circle cx={CENTER} cy={CENTER} r="100" strokeDasharray="0.5 4" />
        <circle cx={CENTER} cy={CENTER} r="60" />

        {/* 24-fold petal ticks */}
        {Array.from({ length: 24 }, (_, i) => {
          const [x1, y1] = pt(i * 15, 100)
          const [x2, y2] = pt(i * 15, 118)
          return <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}

        {/* Expanded seed of life */}
        {seed.map((c, i) => (
          <circle key={`s${i}`} cx={c.cx} cy={c.cy} r={c.r} />
        ))}

        {/* Double hexagram + pentagram */}
        <path d={polygon(3, 88, -90)} />
        <path d={polygon(3, 88, 90)} />
        <path d={starPath(5, 50, 2, -90)} />
      </g>

      <g fill={color} stroke="none">
        <path d={GLYPHS.om.d} transform={`translate(${CENTER} ${CENTER}) scale(${44 / 1000})`} />
      </g>
    </svg>
  )
}
