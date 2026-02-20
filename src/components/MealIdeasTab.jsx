import { useState } from 'react'
import { MealCard } from './MealCard'
import { MEAL_IDEAS } from '../constants'
export function MealIdeasTab() {
  const [search,setSearch]=useState('');const [fv,setFv]=useState(false);const [fg,setFg]=useState(false)
  const filtered=MEAL_IDEAS.filter(m=>{if(fv&&!m.tags.includes("vegetarian"))return false;if(fg&&!m.tags.includes("gluten-free"))return false;if(search&&!m.name.toLowerCase().includes(search.toLowerCase()))return false;return true})
  const fb=(active,onClick,label)=><button onClick={onClick} style={{background:active?"#335765":"white",color:active?"white":"#335765",border:`1.5px solid ${active?"#335765":"#C8D8D6"}`,borderRadius:99,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button>
  return (
    <div>
      <h2 style={{margin:"0 0 14px",fontSize:18,fontWeight:700,color:"#335765"}}>Meal Ideas</h2>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search meals..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #C8D8D6",fontSize:14,boxSizing:"border-box",marginBottom:12,outline:"none",color:"#335765",background:"white"}}/>
      <div style={{display:"flex",gap:8,marginBottom:16}}>{fb(fv,()=>setFv(!fv),"🌱 Vegetarian only")}{fb(fg,()=>setFg(!fg),"🌾 GF only")}</div>
      <div style={{fontSize:12.5,color:"#74A8A4",marginBottom:12}}>{filtered.length} meals</div>
      {filtered.map(m=><MealCard key={m.name} meal={m}/>)}
    </div>
  )
}
