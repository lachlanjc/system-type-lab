import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { DialRoot, useDialKit } from 'dialkit'
import 'dialkit/styles.css'
import './style.css'

const DEFAULT_TEXT = 'The moon keeps 3 1/2 spare keys under the doormat.'

function isWebKitBrowser() {
  const userAgent = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(userAgent)
  return /AppleWebKit/.test(userAgent) && (isIOS || !/Chrome|Chromium|Edg|OPR/.test(userAgent))
}

function fontVariation(values, quote = '"') {
  const axes = [
    `${quote}wdth${quote} ${values.variableFont.width}`,
    `${quote}wght${quote} ${values.variableFont.weight}`,
  ]
  if (!values.variableFont.automaticOpticalSize) {
    axes.push(`${quote}opsz${quote} ${values.variableFont.opticalSize}`)
  }
  return axes.join(', ')
}

function cssSettings(values) {
  return [
    `font-family: ${values.fontFamily};`,
    `font-size: ${values.classics.fontSize}px;`,
    `font-weight: ${values.variableFont.weight};`,
    `font-style: ${values.features.italic ? 'italic' : 'normal'};`,
    `font-variant-caps: ${values.features.smallCaps ? 'all-small-caps' : 'normal'};`,
    `font-variant-numeric: ${values.features.numerals};`,
    `font-optical-sizing: ${values.variableFont.automaticOpticalSize ? 'auto' : 'none'};`,
    `font-variation-settings: ${fontVariation(values)};`,
    `letter-spacing: ${values.classics.letterSpacing}px;`,
    `line-height: ${values.classics.lineHeight};`,
    `color: ${values.classics.textColor};`,
    `background-color: ${values.classics.backgroundColor};`,
  ].join('\n')
}

function tailwindSettings(values) {
  const arbitrary = (value) => value.replace(/\s+/g, '_')
  return [
    `[font-family:${values.fontFamily}]`,
    `text-[${values.classics.fontSize}px]`,
    `[font-weight:${values.variableFont.weight}]`,
    values.features.italic ? 'italic' : 'not-italic',
    `[font-variant-caps:${values.features.smallCaps ? 'all-small-caps' : 'normal'}]`,
    `[font-variant-numeric:${values.features.numerals}]`,
    `[font-optical-sizing:${values.variableFont.automaticOpticalSize ? 'auto' : 'none'}]`,
    `[font-variation-settings:${arbitrary(fontVariation(values, "'"))}]`,
    `tracking-[${values.classics.letterSpacing}px]`,
    `leading-[${values.classics.lineHeight}]`,
    `text-[${arbitrary(values.classics.textColor)}]`,
    `bg-[${arbitrary(values.classics.backgroundColor)}]`,
  ].join(' ')
}

function App() {
  const specimenRef = useRef(null)
  const valuesRef = useRef(null)

  useEffect(() => {
    specimenRef.current.textContent = DEFAULT_TEXT
  }, [])

  const values = useDialKit('', {
    fontFamily: {
      type: 'select',
      options: [
        { value: 'system-ui', label: 'system-ui' },
        { value: 'ui-rounded', label: 'ui-rounded' },
        { value: 'ui-serif', label: 'ui-serif' },
        { value: 'ui-monospace', label: 'ui-monospace' },
      ],
      default: 'system-ui',
    },
    variableFont: {
      width: [132, 50, 150, 1],
      weight: [520, 100, 900, 10],
      opticalSize: [48, 8, 144, 1],
      automaticOpticalSize: true,
    },
    features: {
      italic: false,
      smallCaps: false,
      numerals: {
        type: 'select',
        options: [
          { value: 'normal', label: 'proportional' },
          { value: 'tabular-nums', label: 'tabular' },
          { value: 'oldstyle-nums', label: 'oldstyle' },
          { value: 'diagonal-fractions', label: 'fractions' },
          { value: 'slashed-zero', label: 'slashed zero' },
        ],
        default: 'normal',
      },
    },
    classics: {
      fontSize: [84, 28, 200, 1],
      letterSpacing: [-4, -12, 20, 0.5],
      lineHeight: [0.96, 0.7, 1.6, 0.01],
      textColor: '#242927',
      backgroundColor: '#d8ece8',
    },
    copyCSS: { type: 'action', label: 'Copy CSS' },
    copyTailwind: { type: 'action', label: 'Copy Tailwind classes' },
  }, {
    id: 'system-type-lab',
    persist: true,
    onAction(path) {
      const current = valuesRef.current
      if (!current) return
      const output = path === 'copyCSS'
        ? cssSettings(current)
        : path === 'copyTailwind'
          ? tailwindSettings(current)
          : null
      if (output) navigator.clipboard.writeText(output).catch(console.error)
    },
  })
  valuesRef.current = values

  const specimenStyle = {
    fontFamily: values.fontFamily,
    fontSize: `${values.classics.fontSize}px`,
    fontWeight: values.variableFont.weight,
    fontStyle: values.features.italic ? 'italic' : 'normal',
    fontVariantCaps: values.features.smallCaps ? 'all-small-caps' : 'normal',
    fontVariantNumeric: values.features.numerals,
    fontOpticalSizing: values.variableFont.automaticOpticalSize ? 'auto' : 'none',
    fontVariationSettings: fontVariation(values),
    letterSpacing: `${values.classics.letterSpacing}px`,
    lineHeight: values.classics.lineHeight,
    color: values.classics.textColor,
  }
  const showBrowserCaption = values.fontFamily.startsWith('ui-') && !isWebKitBrowser()

  return (
    <main className="specimen-surface" style={{ backgroundColor: values.classics.backgroundColor }} aria-label="System type specimen">
      <div
        ref={specimenRef}
        className="specimen-text"
        style={specimenStyle}
        contentEditable
        role="textbox"
        aria-label="Edit specimen text"
        aria-multiline="true"
        spellCheck={false}
      />
      <p
        className={`browser-caption${showBrowserCaption ? ' browser-caption-visible' : ''}`}
        style={{ color: values.classics.textColor }}
        aria-hidden={!showBrowserCaption}
      >
        ui-* font families only work in WebKit browsers.<br />This browser may show a fallback.
      </p>
      <DialRoot position="top-right" theme="light" defaultOpen productionEnabled />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
