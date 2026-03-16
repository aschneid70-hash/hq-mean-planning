import { useState } from 'react'

export function TagBadge({ tag }) {
  const s = {
    vegetarian: { bg: "#d4e8c2", color: "#2d5a1b", label: "🌱 Veg" },
    "gluten-free": { bg: "#c8dfe6", color: "#1a4a56", label: "🌾 GF" },
    "gluten-free-adaptable": { bg: "#e8ded6", color: "#7F543D", label: "⚡ GF Adaptable" }
  }[tag] || { bg: "#dde8ea", color: "#296374", label: tag }
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 600, marginRight: 4, display: "inline-block" }}>
      {s.label}
    </span>
  )
}

function RecipeModal({ meal, onClose }) {
  const recipe = meal.recipe
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(12,44,85,0.45)", zIndex: 1000, backdropFilter: "blur(2px)" }}
      />
      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white", borderRadius: 18, padding: "24px 22px",
        zIndex: 1001, width: "min(92vw, 520px)",
        maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 8px 40px rgba(12,44,85,0.22)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#0C2C55", marginBottom: 4 }}>{meal.name}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {recipe.prepTime && (
                <span style={{ fontSize: 12, color: "#629FAD", fontWeight: 600 }}>🕐 Prep: {recipe.prepTime}</span>
              )}
              {recipe.cookTime && (
                <span style={{ fontSize: 12, color: "#629FAD", fontWeight: 600 }}>🍳 Cook: {recipe.cookTime}</span>
              )}
              {recipe.servings && (
                <span style={{ fontSize: 12, color: "#629FAD", fontWeight: 600 }}>👨‍👩‍👧‍👦 Serves: {recipe.servings}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "#f0e6e0", color: "#7F543D", border: "none", borderRadius: 8, width: 30, height: 30, fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
          {(meal.tags || []).map(t => <TagBadge key={t} tag={t} />)}
        </div>

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0C2C55", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              🧺 Ingredients
            </div>
            <div style={{ background: "#f5f9fa", borderRadius: 10, padding: "12px 14px" }}>
              {recipe.ingredients.map((ing, i) => (
                <div key={i} style={{ fontSize: 13.5, color: "#296374", padding: "4px 0", borderBottom: i < recipe.ingredients.length - 1 ? "1px solid #e8f0f2" : "none", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#a8c4cc", fontSize: 10 }}>●</span>
                  {ing}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {recipe.steps?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0C2C55", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              👩‍🍳 Instructions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recipe.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ background: "#0C2C55", color: "white", borderRadius: "50%", width: 24, height: 24, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13.5, color: "#296374", lineHeight: 1.55, flex: 1 }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family Notes */}
        {recipe.notes && (
          <div style={{ background: "#fffbf0", border: "1.5px solid #f0d080", borderRadius: 10, padding: "10px 14px", marginTop: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#7F543D", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              💡 Family Notes
            </div>
            <div style={{ fontSize: 13, color: "#5a3e1b", lineHeight: 1.5 }}>{recipe.notes}</div>
          </div>
        )}
      </div>
    </>
  )
}

export function MealCard({ meal, onAdd, onRemove, inPlan, compact }) {
  const [showRecipe, setShowRecipe] = useState(false)
  const hasRecipe = !!meal.recipe
  const isLoadingRecipe = meal.recipeLoading === true

  return (
    <>
      <div style={{ background: "white", border: "1.5px solid #a8c4cc", borderRadius: 14, padding: compact ? "11px 14px" : "15px 18px", marginBottom: 10, boxShadow: "0 1px 4px rgba(12,44,85,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0C2C55", marginBottom: 3 }}>{meal.name}</div>
            {!compact && <div style={{ fontSize: 12.5, color: "#629FAD", marginBottom: 6 }}>{meal.description}</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              {meal.tags.map(t => <TagBadge key={t} tag={t} />)}
              <span style={{ fontSize: 11, color: "#629FAD", marginLeft: 4, lineHeight: "20px" }}>⏱ {meal.time}min</span>
            </div>

            {/* Recipe button — shown when in plan */}
            {inPlan && (
              <div style={{ marginTop: 8 }}>
                {isLoadingRecipe ? (
                  <span style={{ fontSize: 12, color: "#629FAD", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-block", width: 11, height: 11, border: "2px solid rgba(98,159,173,0.3)", borderTopColor: "#629FAD", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Generating recipe...
                  </span>
                ) : hasRecipe ? (
                  <button
                    onClick={() => setShowRecipe(true)}
                    style={{ background: "#e8f4f4", color: "#296374", border: "1.5px solid #a8c4cc", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    📖 View Recipe
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            {onAdd && !inPlan && (
              <button onClick={() => onAdd(meal)} style={{ background: "#0C2C55", color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                + Add
              </button>
            )}
            {onRemove && inPlan && (
              <button onClick={onRemove} style={{ background: "#f0e6e0", color: "#7F543D", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {showRecipe && hasRecipe && (
        <RecipeModal meal={meal} onClose={() => setShowRecipe(false)} />
      )}
    </>
  )
}
