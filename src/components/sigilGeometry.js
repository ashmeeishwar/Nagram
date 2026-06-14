// Shared geometry helpers for the Nagram sigil art.
// Everything works in a 240×240 viewBox centred on (120, 120).

export const CENTER = 120
export const GOLD = '#c9a23f'

// Point on a circle. Angle in degrees, 0° = +x axis, clockwise (SVG y-down).
export function pt(angleDeg, radius, cx = CENTER, cy = CENTER) {
  const a = (angleDeg * Math.PI) / 180
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)]
}

// Seed of Life: a centre circle plus six circles whose centres sit on it.
export function seedOfLife(radius, cx = CENTER, cy = CENTER) {
  const centres = [[cx, cy]]
  for (let i = 0; i < 6; i++) {
    centres.push(pt(i * 60, radius, cx, cy))
  }
  return centres.map(([x, y]) => ({ cx: x, cy: y, r: radius }))
}

// Regular polygon path string. `start` rotates the first vertex.
export function polygon(sides, radius, start = -90, cx = CENTER, cy = CENTER) {
  const pts = []
  for (let i = 0; i < sides; i++) {
    pts.push(pt(start + (i * 360) / sides, radius, cx, cy))
  }
  return 'M' + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L') + 'Z'
}

// Star polygon (e.g. pentagram) by connecting every `step`-th vertex.
export function starPath(points, radius, step, start = -90, cx = CENTER, cy = CENTER) {
  const order = []
  let i = 0
  do {
    order.push(pt(start + (i * 360) / points, radius, cx, cy))
    i = (i + step) % points
  } while (i !== 0)
  return 'M' + order.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L') + 'Z'
}
