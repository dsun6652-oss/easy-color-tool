import { useState, useCallback, useEffect } from 'react'
import './App.css'

// 解析 HEX (#fff, #ffffff)
function parseHex(str) {
  const s = str.trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    const r = parseInt(s[0] + s[0], 16)
    const g = parseInt(s[1] + s[1], 16)
    const b = parseInt(s[2] + s[2], 16)
    return { r, g, b }
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) {
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    }
  }
  return null
}

// 解析 RGB rgb(255,255,255) 或 rgb(255, 255, 255)
function parseRgb(str) {
  const m = str.trim().match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/)
  if (!m) return null
  const r = Math.min(255, Math.max(0, parseInt(m[1], 10)))
  const g = Math.min(255, Math.max(0, parseInt(m[2], 10)))
  const b = Math.min(255, Math.max(0, parseInt(m[3], 10)))
  return { r, g, b }
}

// 解析 HSL hsl(0,0%,100%) 或 hsl(0, 0%, 100%)
function parseHsl(str) {
  const m = str.trim().match(/^hsl\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*\)$/)
  if (!m) return null
  const h = ((parseFloat(m[1]) % 360) + 360) % 360
  const s = Math.min(100, Math.max(0, parseFloat(m[2])))
  const l = Math.min(100, Math.max(0, parseFloat(m[3])))
  return { h, s, l }
}

// RGB → HEX
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

// RGB → HSL
function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s
  const l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      default:
        h = ((r - g) / d + 4) / 6
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// HSL → RGB
function hslToRgb(h, s, l) {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

// 从输入解析出 { r, g, b }，支持 HEX/RGB/HSL
function parseColor(input) {
  if (!input || !input.trim()) return null
  const s = input.trim()
  let rgb = parseHex(s) ?? parseRgb(s)
  if (rgb) return rgb
  const hsl = parseHsl(s)
  if (hsl) return hslToRgb(hsl.h, hsl.s, hsl.l)
  return null
}

const DEFAULT_HEX = '#58a6ff'
const DEFAULT_RGB = 'rgb(88, 166, 255)'
const DEFAULT_HSL = 'hsl(214, 100%, 67%)'

function App() {
  const [input, setInput] = useState('')
  const [hex, setHex] = useState('')
  const [rgb, setRgb] = useState('')
  const [hsl, setHsl] = useState('')
  const [previewColor, setPreviewColor] = useState(null)
  const [error, setError] = useState('')
  const [copiedFormat, setCopiedFormat] = useState(null)

  const updateFromRgb = useCallback(({ r, g, b }) => {
    setHex(rgbToHex(r, g, b))
    setRgb(`rgb(${r}, ${g}, ${b})`)
    const { h, s, l } = rgbToHsl(r, g, b)
    setHsl(`hsl(${h}, ${s}%, ${l}%)`)
    setPreviewColor(rgbToHex(r, g, b))
  }, [])

  useEffect(() => {
    if (!input.trim()) {
      setHex('')
      setRgb('')
      setHsl('')
      setPreviewColor(null)
      setError('')
      return
    }
    const rgb = parseColor(input)
    if (rgb) {
      updateFromRgb(rgb)
      setError('')
    } else {
      setHex('')
      setRgb('')
      setHsl('')
      setPreviewColor(null)
      setError('无法解析颜色，请使用 HEX / RGB / HSL 格式')
    }
  }, [input, updateFromRgb])

  const copyToClipboard = useCallback(async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopiedFormat(text)
      setTimeout(() => setCopiedFormat(null), 2000)
    } catch {
      setError('复制失败')
    }
  }, [])

  const clearAll = useCallback(() => {
    setInput('')
    setHex('')
    setRgb('')
    setHsl('')
    setPreviewColor(null)
    setError('')
  }, [])

  const resetToDefault = useCallback(() => {
    setInput(DEFAULT_HEX)
    setHex(rgbToHex(88, 166, 255))
    setRgb(DEFAULT_RGB)
    setHsl(DEFAULT_HSL)
    setPreviewColor(DEFAULT_HEX)
    setError('')
  }, [])

  const hasResult = hex || rgb || hsl

  return (
    <div className="app">
      <header className="header">
        <h1>颜色格式转换</h1>
        <p className="subtitle">HEX ↔ RGB ↔ HSL 互转，实时预览，一键复制</p>
      </header>

      <div className="toolbar">
        <div className="toolbar-left">
          <button onClick={resetToDefault} className="btn btn-secondary">
            重置示例
          </button>
        </div>
        <div className="toolbar-right">
          <button onClick={clearAll} className="btn btn-ghost">
            清空
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">!</span>
          {error}
        </div>
      )}

      <div className="color-container">
        <div className="panel input-panel">
          <div className="panel-header">
            <span>输入颜色</span>
          </div>
          <div className="input-row">
            <input
              type="text"
              className="color-input"
              placeholder="#ffffff 或 rgb(255,255,255) 或 hsl(0,0%,100%)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
            {previewColor && (
              <div
                className="color-preview"
                style={{ backgroundColor: previewColor }}
                title={previewColor}
              />
            )}
          </div>
        </div>

        <div className="panel output-panel">
          <div className="panel-header">
            <span>转换结果</span>
          </div>
          <div className="output-list">
            {hex && (
              <div className="output-item">
                <span className="output-label">HEX</span>
                <div className="output-value-row">
                  <code className="output-value">{hex}</code>
                  <button
                    onClick={() => copyToClipboard(hex)}
                    className="btn btn-copy"
                    title="复制 HEX"
                  >
                    {copiedFormat === hex ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            )}
            {rgb && (
              <div className="output-item">
                <span className="output-label">RGB</span>
                <div className="output-value-row">
                  <code className="output-value">{rgb}</code>
                  <button
                    onClick={() => copyToClipboard(rgb)}
                    className="btn btn-copy"
                    title="复制 RGB"
                  >
                    {copiedFormat === rgb ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            )}
            {hsl && (
              <div className="output-item">
                <span className="output-label">HSL</span>
                <div className="output-value-row">
                  <code className="output-value">{hsl}</code>
                  <button
                    onClick={() => copyToClipboard(hsl)}
                    className="btn btn-copy"
                    title="复制 HSL"
                  >
                    {copiedFormat === hsl ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            )}
            {!hasResult && (
              <span className="placeholder">
                输入任意格式颜色后，将显示 HEX / RGB / HSL 转换结果
              </span>
            )}
          </div>
        </div>
      </div>

      {previewColor && (
        <div className="preview-block">
          <div
            className="preview-color-block"
            style={{ backgroundColor: previewColor }}
          />
          <span className="preview-label">实时预览</span>
        </div>
      )}

      <footer className="footer">
        <span>支持 HEX、RGB、HSL 互转，实时预览，一键复制</span>
        <p className="footer-sponsor">
          若对你有帮助，欢迎
          <a
            href="https://afdian.com/a/sundd1898"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-sponsor-link"
          >
            支持作者（爱发电）
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
