// Generate the static favicon SVG and rasterised PWA icon PNGs from the same
// glyph + geometry source used by the React components. Run with: npm run icons
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { GLYPHS } from '../src/components/devanagariGlyphs.js'
import { CENTER, GOLD, pt, polygon } from '../src/components/sigilGeometry.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')
mkdirSync(publicDir, { recursive: true })

// Build the app-icon SVG markup. `padding` (0–1) shrinks the art for maskable
// safe-zone; `background` paints a solid backdrop (else transparent).
function appIconSvg({ background = 'none', padding = 0 } = {}) {
  const [naX, naY] = pt(-90, 84)
  const scale = 1 - padding
  const t = (240 * padding) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  ${background !== 'none' ? `<rect x="0" y="0" width="240" height="240" fill="${background}"/>` : ''}
  <g transform="translate(${t} ${t}) scale(${scale})">
    <g fill="none" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="${CENTER}" cy="${CENTER}" r="104"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="96" stroke-width="1.5" opacity="0.6"/>
      <path d="${polygon(3, 74, -90)}"/>
      <path d="${polygon(3, 74, 90)}"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="40" stroke-width="1.5" opacity="0.7"/>
    </g>
    <g fill="${GOLD}" stroke="none">
      <path d="${GLYPHS.om.d}" transform="translate(${CENTER} ${CENTER}) scale(${64 / 1000})"/>
      <path d="${GLYPHS.na.d}" transform="translate(${naX} ${naY}) scale(${52 / 1000})"/>
    </g>
  </g>
</svg>`
}

// 1. Source favicon SVG (transparent).
const faviconSvg = appIconSvg()
writeFileSync(resolve(publicDir, 'icon.svg'), faviconSvg)

// 2. Rasterised PNGs for the web manifest.
const dark = '#0c0a08'
const targets = [
  { name: 'pwa-192x192.png', size: 192, svg: appIconSvg({ background: dark }) },
  { name: 'pwa-512x512.png', size: 512, svg: appIconSvg({ background: dark }) },
  { name: 'apple-touch-icon.png', size: 180, svg: appIconSvg({ background: dark }) },
  // Maskable: solid background + extra padding for the platform safe-zone.
  {
    name: 'maskable-512x512.png',
    size: 512,
    svg: appIconSvg({ background: dark, padding: 0.18 }),
  },
]

for (const { name, size, svg } of targets) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, name))
  console.log('wrote', name)
}

console.log('Icons generated in /public')
