import { useState } from 'react'
import { MealCard } from './MealCard'
import { MEAL_IDEAS, getWeekDays } from '../constants'
import { askClaude, askClaudeJSON } from '../api/claude'

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

export function WeekPlanner({ weekPlan, setWeekPlan, pantryItems, onBuildAiList, onBuildQuickList, switchToGrocery }) {
  const [addingTo, setAddingTo] = useState(null)
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const days = getWeekDays(weekOffset)
  const plannedCount = Object.keys(weekPlan).filter(k => days.some(d => d.key === k)).length

  const suggest = async () => {
    setAiLoading(true)
    setAiResult('')
    try {
      setAiResult(await askClaude('Suggest a 7-day dinner plan. Mix vegetarian+GF nights with nights the wife eats differently. Quick weeknight meals + something special for the weekend. Format: "Day: Meal — one-line note."'))
    } catch {
      setAiResult('Could not get suggestions — please try again.')
    }
    setAiLoading(false)
  }

  const handleAddMeal = async (dayKey, meal) => {
    // Immediately add meal to plan with loading state
    const mealWithLoading = { ...meal, recipeLoading: true, recipe: null }
    setWeekPlan(p => ({ ...p, [dayKey]: mealWithLoading }))
    setAddingTo(null)

    // Generate recipe in background
    try {
      const recipe = await generateRecipeForMeal(meal)
      setWeekPlan(p => ({
        ...p,
        [dayKey]: { ...meal, recipe, recipeLoading: false }
      }))
    } catch (e) {
      // Recipe failed — still keep the meal, just without recipe
      setWeekPlan(p => ({
        ...p,
        [dayKey]: { ...meal, recipe: null, recipeLoading: false }
      }))
    }
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0C2C55" }}>Dinners</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={suggest}
            disabled={aiLoading}
            style={{ background: "#629FAD", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {aiLoading ? "Planning..." : "✨ AI Suggest Week"}
          </button>
          {plannedCount > 0 && (
            <button
              onClick={() => { onBuildAiList(); switchToGrocery() }}
              style={{ background: "#0C2C55", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              🛒 Grocery List
            </button>
          )}
        </div>
      </div>

      {/* Week toggle */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "#c8d8dc", borderRadius: 10, padding: 3, width: "fit-content" }}>
        {[["This Week", 0], ["Next Week", 1]].map(([label, offset]) => (
          <button
            key={offset}
            onClick={() => { setWeekOffset(offset); setAddingTo(null) }}
            style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: weekOffset === offset ? "#0C2C55" : "transparent", color: weekOffset === offset ? "white" : "#0C2C55", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
          >
            {label}
          </button>
        ))}
      </div>

      {aiResult && (
        <div style={{ background: "#e8f4f4", border: "1.5px solid #629FAD", borderRadius: 12, padding: "14px 16px", marginBottom: 16, fontSize: 13.5, color: "#0C2C55", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
          <strong style={{ display: "block", marginBottom: 6, color: "#629FAD" }}>✨ AI Suggestion:</strong>
          {aiResult}
        </div>
      )}

      {days.map(day => (
        <div key={day.key} style={{ background: "white", border: "1.5px solid #a8c4cc", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 4px rgba(12,44,85,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, color: "#0C2C55", fontSize: 15 }}>{day.label}</span>
              <span style={{ fontSize: 12, color: "#629FAD" }}>{day.date}</span>
            </div>
            <button
              onClick={() => setAddingTo(addingTo === day.key ? null : day.key)}
              style={{ background: "#dde8ea", border: "none", borderRadius: 8, padding: "5px 11px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#0C2C55" }}
            >
              {addingTo === day.key ? "Close" : weekPlan[day.key] ? "Change" : "+ Pick Meal"}
            </button>
          </div>

          {weekPlan[day.key] ? (
            <div style={{ marginTop: 8 }}>
              <MealCard
                meal={weekPlan[day.key]}
                onRemove={() => setWeekPlan(p => { const n = { ...p }; delete n[day.key]; return n })}
                inPlan
                compact
              />
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#a8c4cc", marginTop: 4 }}>Nothing planned yet</div>
          )}

          {/* Meal picker */}
          {addingTo === day.key && (
            <div style={{ marginTop: 10, borderTop: "1px solid #dde8ea", paddingTop: 10 }}>
              <div style={{ fontSize: 12, color: "#629FAD", marginBottom: 8, fontWeight: 600 }}>Pick a meal:</div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {MEAL_IDEAS.map(m => (
                  <MealCard
                    key={m.name}
                    meal={m}
                    onAdd={(meal) => handleAddMeal(day.key, meal)}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {plannedCount > 0 && (
        <div style={{ background: "#d4e4e8", border: "1.5px solid #629FAD", borderRadius: 14, padding: "16px", marginTop: 4 }}>
          <div style={{ fontWeight: 700, color: "#0C2C55", fontSize: 14, marginBottom: 4 }}>🛒 Ready to shop?</div>
          <div style={{ fontSize: 13, color: "#296374", marginBottom: 12 }}>
            {plannedCount} meal{plannedCount > 1 ? "s" : ""} planned for {weekOffset === 0 ? "this" : "next"} week.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { onBuildAiList(); switchToGrocery() }} style={{ background: "#0C2C55", color: "white", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>✨ AI List (with quantities)</button>
            <button onClick={() => { onBuildQuickList(); switchToGrocery() }} style={{ background: "white", color: "#0C2C55", border: "1.5px solid #629FAD", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Quick List</button>
          </div>
        </div>
      )}
    </div>
  )
}
