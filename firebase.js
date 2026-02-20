import { useState } from 'react'
import { CAT_EMOJIS, MANUAL_CATEGORIES } from '../constants'
import { askClaudeJSON } from '../api/claude'

export function GroceryList({ groceryList, setGroceryList, checkedItems, setCheckedItems, grocerySource, pantryItems, storeRouteInfo, setStoreRouteInfo, onRegenerate, plannedCount }) {
  const [manualInput, setManualInput]       = useState('')
  const [manualCat, setManualCat]           = useState('Other')
  const [copyMsg, setCopyMsg]               = useState('')
  const [storeInput, setStoreInput]         = useState('')
  const [storeLoading, setStoreLoading]     = useState(false)
  const [showStorePanel, setShowStorePanel] = useState(false)

  const totalItems   = Object.values(groceryList).reduce((s, i) => s + i.length, 0)
  const checkedCount = Object.keys(checkedItems).filter(k => checkedItems[k]).length

  const toggle     = (cat, idx) => setCheckedItems({ ...checkedItems, [`${cat}-${idx}`]: !checkedItems[`${cat}-${idx}`] })
  const removeItem = (cat, idx) => {
    const u = { ...groceryList }
    u[cat] = u[cat].filter((_, i) => i !== idx)
    if (!u[cat].length) delete u[cat]
    setGroceryList(u)
    const n = { ...checkedItems }; delete n[`${cat}-${idx}`]; setCheckedItems(n)
  }
  const addManual = () => {
    if (!manualInput.trim()) return
    setGroceryList({ ...groceryList, [manualCat]: [...(groceryList[manualCat] || []), { name: manualInput.trim(), sources: ["added manually"] }] })
    setManualInput('')
  }
  const copyList = () => {
    let text = `🛒 HQ Meal Planning — Grocery List${storeRouteInfo ? ` (${storeRouteInfo.storeName})` : ''}\n`
    if (grocerySource) text += `${grocerySource}\n\n`
    for (const [cat, items] of Object.entries(groceryList)) { text += `${cat}:\n`; items.forEach(i => { text += `  • ${i.name}\n` }); text += '\n' }
    navigator.clipboard.writeText(text).then(() => { setCopyMsg('Copied!'); setTimeout(() => setCopyMsg(''), 2000) }).catch(() => {})
  }

  const applyStoreRoute = async () => {
    if (!storeInput.trim() || !totalItems) return
    setStoreLoading(true)
    const allItems = Object.values(groceryList).flat()
    const sourceMap = {}
    allItems.forEach(item => { sourceMap[item.name.toLowerCase()] = item.sources || [] })
    try {
      const parsed = await askClaudeJSON(
        `Shopping at "${storeInput.trim()}". Items: ${allItems.map(i => i.name).join(', ')}.
Re-organize into efficient walking order (produce first, frozen/dairy last).
Return ONLY: { "storeName": "...", "note": "one helpful tip", "sections": [{ "label": "...", "emoji": "...", "items": ["..."] }] }`,
        'You are a grocery store layout expert. Respond ONLY with valid JSON, no markdown.'
      )
      const reordered = {}
      parsed.sections.forEach(sec => {
        const key = `${sec.emoji || ''} ${sec.label}`.trim()
        reordered[key] = sec.items.map(name => ({ name, sources: sourceMap[name.toLowerCase()] || [] }))
      })
      setGroceryList(reordered); setCheckedItems({})
      setStoreRouteInfo({ storeName: parsed.storeName, note: parsed.note })
      setShowStorePanel(false)
    } catch (e) { console.error('Store route failed', e) }
    setStoreLoading(false)
  }

  if (!totalItems) return (
    <div style={{ textAlign: "center", padding: "56px 24px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#335765", marginBottom: 8 }}>No grocery list yet</div>
      <div style={{ fontSize: 14, color: "#74A8A4", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
        Go to <strong>Week Planner</strong>, pick your meals, then tap <strong>"Grocery List"</strong>.
      </div>
    </div>
  )

  const btn = (label, onClick, opts = {}) => (
    <button onClick={onClick} disabled={opts.disabled} style={{
      background: opts.disabled ? "#C8D8D6" : (opts.variant === "outline" ? "white" : (opts.variant === "brown" ? "#7F543D" : "#335765")),
      color: opts.disabled ? "#a0bab8" : (opts.variant === "outline" ? "#335765" : "white"),
      border: opts.variant === "outline" ? "1.5px solid #74A8A4" : "none",
      borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600,
      cursor: opts.disabled ? "default" : "pointer", whiteSpace: "nowrap",
      transition: "background 0.15s",
      ...opts.style,
    }}>{label}</button>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#335765" }}>
          🛒 Grocery List
          {storeRouteInfo && <span style={{ fontSize: 13, fontWeight: 500, color: "#74A8A4", marginLeft: 8 }}>— {storeRouteInfo.storeName}</span>}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {btn("Uncheck All", () => setCheckedItems({}), { variant: "outline" })}
          {btn(copyMsg || "📋 Copy", copyList, { style: { padding: "8px 12px" } })}
        </div>
      </div>

      {/* Store routing banner */}
      <div style={{ marginBottom: 14 }}>
        {storeRouteInfo ? (
          <div style={{ background: "linear-gradient(135deg, #f5ede6, #f0e8de)", border: "1.5px solid #c4956a", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#7F543D", marginBottom: 3 }}>🗺 Optimized for {storeRouteInfo.storeName}</div>
                {storeRouteInfo.note && <div style={{ fontSize: 12.5, color: "#9a6848" }}>{storeRouteInfo.note}</div>}
              </div>
              <button onClick={() => setShowStorePanel(!showStorePanel)} style={{ background: "#7F543D", color: "white", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Change Store</button>
            </div>
          </div>
        ) : (
          <div style={{ background: "linear-gradient(135deg, #e4eeec, #ddeae8)", border: "1.5px solid #74A8A4", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#335765", marginBottom: 2 }}>🗺 Optimize for your store</div>
                <div style={{ fontSize: 12.5, color: "#4a6a6a" }}>Sort by aisle order — shop without backtracking.</div>
              </div>
              <button onClick={() => setShowStorePanel(!showStorePanel)} style={{ background: "#335765", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {showStorePanel ? "Cancel" : "Set Store →"}
              </button>
            </div>
          </div>
        )}

        {showStorePanel && (
          <div style={{ background: "white", border: "1.5px solid #C8D8D6", borderRadius: 12, padding: "16px", marginTop: 10, boxShadow: "0 4px 16px rgba(51,87,101,0.1)" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#335765", marginBottom: 4 }}>Which store are you shopping at?</div>
            <div style={{ fontSize: 12.5, color: "#74A8A4", marginBottom: 12 }}>Be specific — e.g. "Giant Eagle Westlake Ohio", "Trader Joe's Westlake OH", "Kroger Pearl Rd Strongsville"</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={storeInput} onChange={e => setStoreInput(e.target.value)} onKeyDown={e => e.key === "Enter" && applyStoreRoute()} placeholder="e.g. Giant Eagle Westlake Ohio" style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #C8D8D6", fontSize: 14, outline: "none", color: "#335765" }} autoFocus />
              <button onClick={applyStoreRoute} disabled={storeLoading || !storeInput.trim()} style={{ background: storeInput.trim() && !storeLoading ? "#335765" : "#C8D8D6", color: "white", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, cursor: storeInput.trim() && !storeLoading ? "pointer" : "default", fontSize: 14, whiteSpace: "nowrap" }}>
                {storeLoading ? "Routing..." : "✨ Optimize"}
              </button>
            </div>
            {storeLoading && <div style={{ marginTop: 10, fontSize: 13, color: "#74A8A4" }}>⏳ Mapping your items to {storeInput}'s aisles...</div>}
            <div style={{ marginTop: 10, fontSize: 12, color: "#a0bab8" }}>💡 Works with: Giant Eagle, Kroger, Meijer, Walmart, Target, Trader Joe's, Whole Foods, ALDI, Costco & more</div>
          </div>
        )}
      </div>

      {grocerySource && <div style={{ fontSize: 12.5, color: "#74A8A4", marginBottom: 12, fontStyle: "italic" }}>{grocerySource}{pantryItems.length > 0 && ` · Excluding ${pantryItems.length} pantry item${pantryItems.length > 1 ? "s" : ""}`}</div>}

      {/* Progress bar */}
      <div style={{ background: "#e4eeec", border: "1.5px solid #74A8A4", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13.5, color: "#335765", fontWeight: 700, whiteSpace: "nowrap" }}>{checkedCount}/{totalItems}</span>
        <div style={{ flex: 1, background: "#C8D8D6", borderRadius: 99, height: 8, overflow: "hidden" }}>
          <div style={{ background: "#335765", height: "100%", width: `${Math.round((checkedCount / totalItems) * 100)}%`, borderRadius: 99, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 12, color: "#335765", fontWeight: 700, whiteSpace: "nowrap" }}>{Math.round((checkedCount / totalItems) * 100)}%</span>
      </div>

      {/* Section cards */}
      {Object.entries(groceryList).map(([category, items], idx) => {
        const em = (() => { const m = category.match(/^(\S+)\s/); return m && /\p{Emoji}/u.test(m[1]) ? m[1] : (CAT_EMOJIS[category] || "🛒") })()
        const label = em && category.startsWith(em) ? category.slice(em.length).trim() : category
        const catChecked = items.filter((_, i) => checkedItems[`${category}-${i}`]).length
        const allDone = catChecked === items.length

        return (
          <div key={category} style={{ background: "white", border: allDone ? "1.5px solid #74A8A4" : "1.5px solid #C8D8D6", borderRadius: 14, marginBottom: 12, overflow: "hidden", opacity: allDone ? 0.65 : 1, transition: "all 0.2s", boxShadow: "0 1px 4px rgba(51,87,101,0.06)" }}>
            <div style={{ padding: "11px 16px", background: allDone ? "#e4eeec" : "#f7fafa", borderBottom: `1px solid ${allDone ? "#B6D9E0" : "#e8f0ef"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {storeRouteInfo && (
                  <span style={{ background: "#335765", color: "white", borderRadius: 99, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{idx + 1}</span>
                )}
                <span style={{ fontWeight: 700, fontSize: 14, color: allDone ? "#74A8A4" : "#335765" }}>{em} {label}</span>
              </div>
              <span style={{ fontSize: 12, color: allDone ? "#74A8A4" : "#a0bab8", fontWeight: allDone ? 700 : 400 }}>{allDone ? "✓ Done" : `${catChecked}/${items.length}`}</span>
            </div>
            <div style={{ padding: "6px 0" }}>
              {items.map((item, i) => {
                const checked = !!checkedItems[`${category}-${i}`]
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: checked ? "#f7fafa" : "white" }}>
                    <div onClick={() => toggle(category, i)} style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                      border: checked ? "none" : "2px solid #C8D8D6",
                      background: checked ? "#335765" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                    }}>
                      {checked && <span style={{ color: "white", fontSize: 13, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span onClick={() => toggle(category, i)} style={{ fontSize: 14, color: checked ? "#a0bab8" : "#335765", textDecoration: checked ? "line-through" : "none", flex: 1, cursor: "pointer" }}>{item.name}</span>
                    {item.sources?.length > 0 && !checked && item.sources[0] !== "added manually" && (
                      <span style={{ fontSize: 11, color: "#B6D9E0", textAlign: "right", maxWidth: 120, lineHeight: 1.3, flexShrink: 0 }}>{item.sources.slice(0, 2).join(", ")}</span>
                    )}
                    <button onClick={() => removeItem(category, i)} style={{ background: "none", border: "none", color: "#C8D8D6", fontSize: 16, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}
                      onMouseEnter={e => e.target.style.color = "#7F543D"}
                      onMouseLeave={e => e.target.style.color = "#C8D8D6"}>×</button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Manual add */}
      <div style={{ background: "white", border: "1.5px dashed #B6D9E0", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#74A8A4", marginBottom: 10 }}>+ Add an item manually</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={manualInput} onChange={e => setManualInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addManual()} placeholder="e.g. dish soap, paper towels..." style={{ flex: 1, minWidth: 140, padding: "9px 12px", borderRadius: 8, border: "1.5px solid #C8D8D6", fontSize: 13.5, outline: "none", color: "#335765" }} />
          <select value={manualCat} onChange={e => setManualCat(e.target.value)} style={{ padding: "9px 10px", borderRadius: 8, border: "1.5px solid #C8D8D6", fontSize: 13, color: "#335765", background: "white", cursor: "pointer", outline: "none" }}>
            {MANUAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={addManual} disabled={!manualInput.trim()} style={{ background: manualInput.trim() ? "#335765" : "#C8D8D6", color: "white", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, cursor: manualInput.trim() ? "pointer" : "default", fontSize: 13 }}>Add</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={onRegenerate} disabled={!plannedCount} style={{ background: plannedCount ? "#74A8A4" : "#C8D8D6", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: plannedCount ? "pointer" : "default", fontSize: 13 }}>🔄 Regenerate</button>
        <button onClick={copyList} style={{ background: "#335765", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{copyMsg || "📋 Copy to Clipboard"}</button>
      </div>
    </div>
  )
}
