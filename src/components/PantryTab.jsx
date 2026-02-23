import { useState } from 'react'
import { MealCard } from './MealCard'
import { MEAL_IDEAS } from '../constants'
import { askClaude } from '../api/claude'
export function PantryTab({ pantryItems, setPantryItems }) {
  const [input,setInput]=useState('');const [matches,setMatches]=useState([]);const [aiText,setAiText]=useState('');const [aiInput,setAiInput]=useState('');const [aiLoading,setAiLoading]=useState(false)
  const addItems=()=>{const items=input.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);setPantryItems([...new Set([...pantryItems,...items])]);setInput('')}
  const findMatches=()=>{setMatches(MEAL_IDEAS.filter(meal=>meal.ingredients.filter(ing=>pantryItems.some(p=>ing.toLowerCase().includes(p)||p.includes(ing.toLowerCase()))).length>=2).sort((a,b)=>{const s=m=>m.ingredients.filter(ing=>pantryItems.some(p=>ing.toLowerCase().includes(p)||p.includes(ing.toLowerCase()))).length;return s(b)-s(a)}))}
  const getAiIdeas=async()=>{if(!aiInput.trim())return;setAiLoading(true);setAiText('');try{setAiText(await askClaude(`I have: ${aiInput}. What dinners can I make tonight? Give 3-4 ideas with brief instructions. Flag: vegetarian, gluten-free, kid notes.`))}catch{setAiText('Could not get suggestions — try again.')}setAiLoading(false)}
  return (
    <div>
      <h2 style={{margin:"0 0 6px",fontSize:18,fontWeight:700,color:"#0C2C55"}}>What's in the Pantry?</h2>
      <p style={{margin:"0 0 16px",fontSize:13.5,color:"#629FAD"}}>Items here get excluded from your grocery list automatically.</p>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItems()} placeholder="e.g. eggs, rice, tomatoes, cheese" style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1.5px solid #a8c4cc",fontSize:14,outline:"none",background:"white",color:"#0C2C55"}}/>
        <button onClick={addItems} style={{background:"#0C2C55",color:"white",border:"none",borderRadius:10,padding:"10px 16px",fontWeight:600,cursor:"pointer"}}>Add</button>
      </div>
      {pantryItems.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{pantryItems.map(item=><span key={item} onClick={()=>setPantryItems(pantryItems.filter(p=>p!==item))} style={{background:"#dde8ea",color:"#0C2C55",borderRadius:99,padding:"4px 12px",fontSize:13,fontWeight:500,cursor:"pointer",border:"1px solid #a8c4cc"}}>{item} ×</span>)}</div>}
      <button onClick={findMatches} disabled={!pantryItems.length} style={{background:pantryItems.length?"#0C2C55":"#a8c4cc",color:"white",border:"none",borderRadius:10,padding:"10px 18px",fontWeight:700,cursor:pantryItems.length?"pointer":"default",fontSize:14,marginBottom:20}}>🔍 Find Meals I Can Make</button>
      <div style={{background:"white",border:"1.5px solid #629FAD",borderRadius:12,padding:"16px",marginBottom:20,boxShadow:"0 1px 6px rgba(12,44,85,0.06)"}}>
        <div style={{fontWeight:700,fontSize:14,color:"#0C2C55",marginBottom:2}}>✨ Ask AI for Tonight's Ideas</div>
        <div style={{fontSize:12.5,color:"#629FAD",marginBottom:10}}>Describe what's in your fridge in plain language</div>
        <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="e.g. chicken thighs, sweet potatoes, coconut milk..." rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid #a8c4cc",fontSize:13.5,resize:"none",boxSizing:"border-box",outline:"none",color:"#0C2C55"}}/>
        <button onClick={getAiIdeas} disabled={aiLoading||!aiInput.trim()} style={{background:aiInput.trim()&&!aiLoading?"#629FAD":"#a8c4cc",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:600,cursor:"pointer",marginTop:8,fontSize:13}}>{aiLoading?"Thinking...":"Get Suggestions"}</button>
        {aiText&&<div style={{marginTop:12,fontSize:13.5,color:"#0C2C55",whiteSpace:"pre-wrap",lineHeight:1.7,borderTop:"1px solid #dde8ea",paddingTop:12}}>{aiText}</div>}
      </div>
      {matches.length>0&&<><div style={{fontWeight:700,fontSize:15,color:"#0C2C55",marginBottom:10}}>Meals you can make now ({matches.length})</div>{matches.map(m=><MealCard key={m.name} meal={m}/>)}</>}
    </div>
  )
}