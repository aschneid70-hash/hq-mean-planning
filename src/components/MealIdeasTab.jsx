import { useState, useEffect } from 'react'
import { MealCard } from './MealCard'
import { MEAL_IDEAS } from '../constants'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { askClaudeJSON } from '../api/claude'

const CUSTOM_DOC = doc(db, 'hq-meal-planning', 'custom-meals')

async function generateRecipeForMeal(meal) {
  const dietaryNote = `Family dietary needs: wife is vegetarian (no meat), 2 members have celiac disease (strictly gluten-free). ${meal.tags?.includes('vegetarian') ? 'This is a vegetarian meal.' : 'Include a vegetarian swap option for the wife.'} ${meal.tags?.includes('gluten-free') ? 'This meal is gluten-free.' : meal.tags?.includes('gluten-free-adaptable') ? 'Provide gluten-free adaptations.' : 'Note any gluten-free substitutions needed.'}`

  return await askClaudeJSON(
    `Generate a detailed recipe for "${meal.name}" for a family of 5 (2 adults, 3 kids ages 4, 2, 2).
    ${dietaryNote}
    Return ONLY a valid JSON object with these exact keys:
    - prepTime (string, e.g. "15 min")
    - cookTime (string, e.g. "25 min")
    - servings (number)
    - ingredients (array of strings with quantities, e.g. "2 cups rice")
    - steps (array of strings, each a clear instruction step)
    - notes (string — family-specific tips, substitutions for vegetarian/celiac members, kid-friendly suggestions)
    ONLY return valid JSON, no other text.`
  )
}

export function MealIdeasTab() {
  const [search, setSearch] = useState('')
  const [fv, setFv] = useState(false)
  const [fg, setFg] = useState(false)
  const [customMeals, setCustomMeals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [time, setTime] = useState('30')
  const [ingredients, setIngredients] = useState('')
  const [isVeg, setIsVeg] = useState(false)
  const [isGF, setIsGF] = useState(false)
  const [isGFA, setIsGFA] = useState(false)

  // AI suggestion state
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [suggestionError, setSuggestionError] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [includeMeat, setIncludeMeat] = useState(false)

  // Track which meals are having recipes generated
  const [generatingRecipeFor, setGeneratingRecipeFor] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(CUSTOM_DOC, (snap) => {
      if (snap.exists()) setCustomMeals(snap.data().meals || [])
    })
    return () => unsub()
  }, [])

  const allMeals = [...MEAL_IDEAS, ...customMeals]
  const filtered = allMeals.filter(m => {
    if (fv && !m.tags.includes("vegetarian")) return false
    if (fg && !m.tags.includes("gluten-free")) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const saveCustomMeal = () => {
    if (!name.trim()) return
    const tags = []
    if (isVeg) tags.push("vegetarian")
    if (isGF) tags.push("gluten-free")
    if (isGFA) tags.push("gluten-free-adaptable")
    const newMeal = {
      name: name.trim(),
      description: desc.trim() || "Custom family meal",
      time: parseInt(time) || 30,
      tags,
      ingredients: ingredients.split(',').map(s => s.trim()).filter(Boolean),
      custom: true
    }
    const updated = [...customMeals, newMeal]
    setDoc(CUSTOM_DOC, { meals: updated }, { merge: true })
    setName(''); setDesc(''); setTime('30'); setIngredients('')
    setIsVeg(false); setIsGF(false); setIsGFA(false); setShowForm(false)
  }

  const deleteCustomMeal = (mealName) =>
    setDoc(CUSTOM_DOC, { meals: customMeals.filter(m => m.name !== mealName) })

  const generateAiSuggestions = async () => {
    setLoadingSuggestions(true)
    setSuggestionError(null)
    setSuggestions([])
    setShowSuggestions(true)
    const existingNames = allMeals.map(m => m.name).join(', ')

    const meatInstruction = includeMeat
      ? `Some meals can include meat (chicken, beef, pork, etc.) — the wife will have a vegetarian version of those nights. All meals must still have an easy vegetarian swap for the wife.`
      : `All meals must be vegetarian or have an obvious vegetarian main that satisfies everyone.`

    try {
      const result = await askClaudeJSON(
        `Generate 7 creative meal ideas for a family of 5 (2 adults, 3 kids ages 4, 2, 2).
        Constraints: Wife is vegetarian 🌱, 2 family members have celiac (gluten-free 🌾).
        ${meatInstruction}
        All meals should be gluten-free or easily gluten-free adaptable.
        Do NOT suggest any of these existing meals: ${existingNames}.
        Return a JSON array of objects with these exact keys:
        - name (string)
        - description (string, 1 sentence)
        - time (number, cook time in minutes)
        - tags (array of strings from: "vegetarian","gluten-free","gluten-free-adaptable","meat")
        - ingredients (array of ingredient strings)
        ONLY return valid JSON array, no other text.`
      )
      const meals = Array.isArray(result) ? result : Object.values(result)
      setSuggestions(meals)
    } catch (e) {
      setSuggestionError("Couldn't generate suggestions. Please try again.")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  // Accept suggestion: save to custom meals + generate recipe
  const acceptSuggestion = async (meal) => {
    // Remove from suggestions immediately for snappy UX
    setSuggestions(prev => prev.filter(m => m.name !== meal.name))
    setGeneratingRecipeFor(meal.name)

    let mealToSave = { ...meal, custom: true }

    try {
      const recipe = await generateRecipeForMeal(meal)
      mealToSave = { ...mealToSave, recipe }
    } catch (e) {
      // Save without recipe if generation fails
    }

    const updated = [...customMeals, mealToSave]
    setDoc(CUSTOM_DOC, { meals: updated }, { merge: true })
    setGeneratingRecipeFor(null)
  }

  const rejectSuggestion = (mealName) => {
    setSuggestions(prev => prev.filter(m => m.name !== mealName))
  }

  const fb = (active, onClick, label) => (
    <button onClick={onClick} style={{ background: active ? "#0C2C55" : "white", color: active ? "white" : "#0C2C55", border: `1.5px solid ${active ? "#0C2C55" : "#a8c4cc"}`, borderRadius: 99, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
      {label}
    </button>
  )

  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #a8c4cc", fontSize: 13.5, outline: "none", color: "#0C2C55", background: "white", boxSizing: "border-box" }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0C2C55" }}>Meal Ideas</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

          {/* Meat toggle */}
          <div
            onClick={() => setIncludeMeat(!includeMeat)}
            style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", background: includeMeat ? "#fef0e6" : "white", border: `1.5px solid ${includeMeat ? "#e07a30" : "#a8c4cc"}`, borderRadius: 99, padding: "6px 13px" }}
          >
            <div style={{ width: 32, height: 18, borderRadius: 99, background: includeMeat ? "#e07a30" : "#a8c4cc", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2, left: includeMeat ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: includeMeat ? "#e07a30" : "#629FAD", whiteSpace: "nowrap" }}>
              🥩 Include Meat
            </span>
          </div>

          <button
            onClick={generateAiSuggestions}
            disabled={loadingSuggestions}
            style={{ background: loadingSuggestions ? "#629FAD" : "#296374", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: loadingSuggestions ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            {loadingSuggestions ? (
              <>
                <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Generating...
              </>
            ) : "✨ AI Suggest"}
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{ background: showForm ? "#f0e6e0" : "#0C2C55", color: showForm ? "#7F543D" : "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {showForm ? "Cancel" : "+ Add Meal"}
          </button>
        </div>
      </div>

      {/* Recipe generating toast */}
      {generatingRecipeFor && (
        <div style={{ background: "#e8f4f4", border: "1.5px solid #629FAD", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#296374", fontWeight: 600 }}>
          <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(98,159,173,0.3)", borderTopColor: "#629FAD", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
          Generating recipe for {generatingRecipeFor}...
        </div>
      )}

      {/* AI Suggestions Panel */}
      {showSuggestions && (
        <div style={{ background: "white", border: "1.5px solid #629FAD", borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: "0 2px 12px rgba(12,44,85,0.10)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0C2C55" }}>
              ✨ AI Meal Suggestions {includeMeat && <span style={{ fontSize: 12, color: "#e07a30", fontWeight: 600 }}>· 🥩 Meat included</span>}
            </div>
            <button onClick={() => { setShowSuggestions(false); setSuggestions([]) }} style={{ background: "none", border: "none", color: "#629FAD", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          {loadingSuggestions && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#629FAD", fontSize: 13 }}>
              Generating meal ideas for your family...
            </div>
          )}

          {suggestionError && (
            <div style={{ color: "#c0392b", fontSize: 13, padding: "8px 12px", background: "#fdf0ee", borderRadius: 8 }}>
              {suggestionError}
            </div>
          )}

          {!loadingSuggestions && suggestions.length === 0 && !suggestionError && (
            <div style={{ color: "#629FAD", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
              All suggestions reviewed! Hit ✨ AI Suggest to generate more.
            </div>
          )}

          {suggestions.map((meal) => (
            <div key={meal.name} style={{ border: "1.5px solid #EDEDCE", borderRadius: 12, padding: "12px 14px", marginBottom: 10, background: "#fafaf5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0C2C55", marginBottom: 3 }}>{meal.name}</div>
                  <div style={{ fontSize: 12.5, color: "#296374", marginBottom: 5 }}>{meal.description}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, color: "#629FAD" }}>⏱ {meal.time} min</span>
                    {meal.tags?.includes("meat") && <span style={{ fontSize: 11, background: "#fef0e6", color: "#e07a30", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>🥩 Meat</span>}
                    {meal.tags?.includes("vegetarian") && <span style={{ fontSize: 11, background: "#e8f5e9", color: "#2e7d32", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>🌱 Veg</span>}
                    {meal.tags?.includes("gluten-free") && <span style={{ fontSize: 11, background: "#fff8e1", color: "#f57f17", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>🌾 GF</span>}
                    {meal.tags?.includes("gluten-free-adaptable") && <span style={{ fontSize: 11, background: "#fff8e1", color: "#f57f17", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>⚡ GF Adaptable</span>}
                  </div>
                  {meal.ingredients?.length > 0 && (
                    <div style={{ fontSize: 11.5, color: "#629FAD" }}>
                      {meal.ingredients.slice(0, 5).join(', ')}{meal.ingredients.length > 5 ? ` +${meal.ingredients.length - 5} more` : ''}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => acceptSuggestion(meal)}
                    style={{ background: "#0C2C55", color: "white", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    ✓ Add
                  </button>
                  <button
                    onClick={() => rejectSuggestion(meal.name)}
                    style={{ background: "#f0e6e0", color: "#7F543D", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    ✕ Skip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Meal Form */}
      {showForm && (
        <div style={{ background: "white", border: "1.5px solid #629FAD", borderRadius: 14, padding: "16px", marginBottom: 16, boxShadow: "0 2px 8px rgba(12,44,85,0.08)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0C2C55", marginBottom: 12 }}>Add a New Meal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Meal name *" style={inputStyle} />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" style={inputStyle} />
            <input value={time} onChange={e => setTime(e.target.value)} placeholder="Cook time (minutes)" type="number" style={inputStyle} />
            <input value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder="Ingredients (comma separated)" style={inputStyle} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["🌱 Vegetarian", isVeg, setIsVeg], ["🌾 Gluten-Free", isGF, setIsGF], ["⚡ GF Adaptable", isGFA, setIsGFA]].map(([label, val, set]) => (
                <button key={label} onClick={() => set(!val)} style={{ background: val ? "#0C2C55" : "white", color: val ? "white" : "#0C2C55", border: `1.5px solid ${val ? "#0C2C55" : "#a8c4cc"}`, borderRadius: 99, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{label}</button>
              ))}
            </div>
            <button onClick={saveCustomMeal} disabled={!name.trim()} style={{ background: name.trim() ? "#0C2C55" : "#a8c4cc", color: "white", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, cursor: name.trim() ? "pointer" : "default", fontSize: 14 }}>Save Meal</button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meals..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #a8c4cc", fontSize: 14, boxSizing: "border-box", marginBottom: 12, outline: "none", color: "#0C2C55", background: "white" }} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {fb(fv, () => setFv(!fv), "🌱 Vegetarian only")}
        {fb(fg, () => setFg(!fg), "🌾 GF only")}
      </div>
      <div style={{ fontSize: 12.5, color: "#629FAD", marginBottom: 12 }}>
        {filtered.length} meals{customMeals.length > 0 && ` · ${customMeals.length} custom`}
      </div>

      {/* Meal Cards */}
      {filtered.map(m => (
        <div key={m.name} style={{ position: "relative" }}>
          <MealCard meal={m} />
          {m.custom && (
            <button onClick={() => deleteCustomMeal(m.name)} style={{ position: "absolute", top: 8, right: 8, background: "#f0e6e0", color: "#7F543D", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Delete</button>
          )}
        </div>
      ))}
    </div>
  )
}
