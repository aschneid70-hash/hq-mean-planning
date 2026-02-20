import { useState } from 'react'
import { MealCard } from './MealCard'
import { MEAL_IDEAS, DAYS } from '../constants'
import { askClaude } from '../api/claude'
export function WeekPlanner({ weekPlan, setWeekPlan, pantryItems, onBuildAiList, onBuildQuickList, switchToGrocery }) {
  const [addingTo,setAddingTo]=useState(null);const [aiResult,setAiResult]=useState('');const [aiLoading,setAiLoading]=useState(false)
  const plannedCount=Object.keys(weekPlan).length
  const suggest=async()=>{setAiLoading(true);setAiResult('');try{setAiResult(await askClaude('Suggest a 7-day dinner plan. Mix vegetarian+GF nights with nights the wife eats differently. Quick weeknight meals + something special for the weekend. Format: "Day: Meal — one-line note."'))}catch{setAiResult('Could not get suggestions — please try again.')}setAiLoading(false)}
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#335765"}}>This Week's Dinners</h2>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={suggest} disabled={aiLoading} style={{background:"#74A8A4",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{aiLoading?"Planning...":"✨ AI Suggest Week"}</button>
          {plannedCount>0&&<button onClick={()=>{onBuildAiList();switchToGrocery()}} style={{background:"#335765",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>🛒 Grocery List</button>}
        </div>
      </div>
      {aiResult&&<div style={{background:"#e8f4f4",border:"1.5px solid #B6D9E0",borderRadius:12,padding:"14px 16px",marginBottom:16,fontSize:13.5,color:"#335765",whiteSpace:"pre-wrap",lineHeight:1.7}}><strong style={{display:"block",marginBottom:6,color:"#74A8A4"}}>✨ AI Suggestion:</strong>{aiResult}</div>}
      {DAYS.map(day=>(
        <div key={day} style={{background:"white",border:"1.5px solid #C8D8D6",borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 4px rgba(51,87,101,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,color:"#335765",fontSize:15}}>{day}</span>
            <button onClick={()=>setAddingTo(addingTo===day?null:day)} style={{background:"#DBE2DC",border:"none",borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer",color:"#335765"}}>{addingTo===day?"Close":weekPlan[day]?"Change":"+ Pick Meal"}</button>
          </div>
          {weekPlan[day]?<div style={{marginTop:8}}><MealCard meal={weekPlan[day]} onRemove={()=>setWeekPlan(p=>{const n={...p};delete n[day];return n})} inPlan compact/></div>:<div style={{fontSize:13,color:"#a0bab8",marginTop:4}}>Nothing planned yet</div>}
          {addingTo===day&&<div style={{marginTop:10,borderTop:"1px solid #DBE2DC",paddingTop:10}}><div style={{fontSize:12,color:"#74A8A4",marginBottom:8,fontWeight:600}}>Pick a meal:</div><div style={{maxHeight:280,overflowY:"auto"}}>{MEAL_IDEAS.map(m=><MealCard key={m.name} meal={m} onAdd={(meal)=>{setWeekPlan(p=>({...p,[day]:meal}));setAddingTo(null)}} compact/>)}</div></div>}
        </div>
      ))}
      {plannedCount>0&&(
        <div style={{background:"#e4eeec",border:"1.5px solid #74A8A4",borderRadius:14,padding:"16px",marginTop:4}}>
          <div style={{fontWeight:700,color:"#335765",fontSize:14,marginBottom:4}}>🛒 Ready to shop?</div>
          <div style={{fontSize:13,color:"#4a6a6a",marginBottom:12}}>{plannedCount} meal{plannedCount>1?"s":""} planned. {pantryItems.length>0?`${pantryItems.length} pantry items will be excluded.`:"Add pantry items to exclude what you already have."}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>{onBuildAiList();switchToGrocery()}} style={{background:"#335765",color:"white",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:700,cursor:"pointer",fontSize:14}}>✨ AI List (with quantities)</button>
            <button onClick={()=>{onBuildQuickList();switchToGrocery()}} style={{background:"white",color:"#335765",border:"1.5px solid #74A8A4",borderRadius:8,padding:"10px 16px",fontWeight:600,cursor:"pointer",fontSize:13}}>Quick List</button>
          </div>
        </div>
      )}
    </div>
  )
}
