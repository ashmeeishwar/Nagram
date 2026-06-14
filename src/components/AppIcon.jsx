import { GLYPHS } from './devanagariGlyphs'
import { CENTER, GOLD, pt, polygon } from './sigilGeometry'

// Simplified, square app-icon version of the Nagram sigil — bolder line work
// that stays legible at small sizes. Optional solid background for use as a
// PWA / maskable icon (pass background="#0c0a08").

export default function AppIcon({
  size = 192,
  color = GOLD,
  background = 'none',
  title = 'Nagram',
  ...rest
}) {
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
      {background !== 'none' && <rect x="0" y="0" width="240" height="240" fill={background} />}

      <g stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        {/* Outer ring */}
        <circle cx={CENTER} cy={CENTER} r="104" />
        <circle cx={CENTER} cy={CENTER} r="96" strokeWidth="1.5" opacity="0.6" />

        {/* Hexagram */}
        <path d={polygon(3, 74, -90)} />
        <path d={polygon(3, 74, 90)} />

        {/* Central ring */}
        <circle cx={CENTER} cy={CENTER} r="40" strokeWidth="1.5" opacity="0.7" />
      </g>

      <g fill={color} stroke="none">
        {/* ॐ centred */}
        <path d={GLYPHS.om.d} transform={`translate(${CENTER} ${CENTER}) scale(${64 / 1000})`} />
        {/* ना at the top point */}
        {(() => {
          const [x, y] = pt(-90, 84)
          return <path d={GLYPHS.na.d} transform={`translate(${x} ${y}) scale(${52 / 1000})`} />
        })()}
      </g>
    </svg>
  )
}
