export function TagBadge({ tag }) {
  const s={vegetarian:{bg:"#d4e8c2",color:"#2d5a1b",label:"🌱 Veg"},"gluten-free":{bg:"#c8dfe6",color:"#1a4a56",label:"🌾 GF"},"gluten-free-adaptable":{bg:"#e8ded6",color:"#7F543D",label:"⚡ GF Adaptable"}}[tag]||{bg:"#dde8ea",color:"#296374",label:tag}
  return <span style={{background:s.bg,color:s.color,borderRadius:999,padding:"2px 9px",fontSize:11,fontWeight:600,marginRight:4,display:"inline-block"}}>{s.label}</span>
}
export function MealCard({ meal, onAdd, onRemove, inPlan, compact }) {
  return (
    <div style={{background:"white",border:"1.5px solid #a8c4cc",borderRadius:14,padding:compact?"11px 14px":"15px 18px",marginBottom:10,boxShadow:"0 1px 4px rgba(12,44,85,0.07)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:15,color:"#0C2C55",marginBottom:3}}>{meal.name}</div>
          {!compact&&<div style={{fontSize:12.5,color:"#629FAD",marginBottom:6}}>{meal.description}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
            {meal.tags.map(t=><TagBadge key={t} tag={t}/>)}
            <span style={{fontSize:11,color:"#629FAD",marginLeft:4,lineHeight:"20px"}}>⏱ {meal.time}min</span>
          </div>
        </div>
        {onAdd&&!inPlan&&<button onClick={()=>onAdd(meal)} style={{background:"#0C2C55",color:"white",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>+ Add</button>}
        {onRemove&&inPlan&&<button onClick={onRemove} style={{background:"#f0e6e0",color:"#7F543D",border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>✕</button>}
      </div>
    </div>
  )
}