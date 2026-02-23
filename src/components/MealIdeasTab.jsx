import { useState, useEffect } from 'react'
import { MealCard } from './MealCard'
import { MEAL_IDEAS } from '../constants'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
const CUSTOM_DOC=doc(db,'hq-meal-planning','custom-meals')
export function MealIdeasTab() {
  const [search,setSearch]=useState('');const [fv,setFv]=useState(false);const [fg,setFg]=useState(false)
  const [customMeals,setCustomMeals]=useState([]);const [showForm,setShowForm]=useState(false)
  const [name,setName]=useState('');const [desc,setDesc]=useState('');const [time,setTime]=useState('30')
  const [ingredients,setIngredients]=useState('');const [isVeg,setIsVeg]=useState(false);const [isGF,setIsGF]=useState(false);const [isGFA,setIsGFA]=useState(false)
  useEffect(()=>{const unsub=onSnapshot(CUSTOM_DOC,(snap)=>{if(snap.exists())setCustomMeals(snap.data().meals||[])});return()=>unsub()},[])
  const allMeals=[...MEAL_IDEAS,...customMeals]
  const filtered=allMeals.filter(m=>{if(fv&&!m.tags.includes("vegetarian"))return false;if(fg&&!m.tags.includes("gluten-free"))return false;if(search&&!m.name.toLowerCase().includes(search.toLowerCase()))return false;return true})
  const saveCustomMeal=()=>{
    if(!name.trim())return
    const tags=[];if(isVeg)tags.push("vegetarian");if(isGF)tags.push("gluten-free");if(isGFA)tags.push("gluten-free-adaptable")
    const newMeal={name:name.trim(),description:desc.trim()||"Custom family meal",time:parseInt(time)||30,tags,ingredients:ingredients.split(',').map(s=>s.trim()).filter(Boolean),custom:true}
    const updated=[...customMeals,newMeal]
    setDoc(CUSTOM_DOC,{meals:updated},{merge:true})
    setName('');setDesc('');setTime('30');setIngredients('');setIsVeg(false);setIsGF(false);setIsGFA(false);setShowForm(false)
  }
  const deleteCustomMeal=(mealName)=>setDoc(CUSTOM_DOC,{meals:customMeals.filter(m=>m.name!==mealName)})
  const fb=(active,onClick,label)=><button onClick={onClick} style={{background:active?"#0C2C55":"white",color:active?"white":"#0C2C55",border:`1.5px solid ${active?"#0C2C55":"#a8c4cc"}`,borderRadius:99,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{label}</button>
  const inputStyle={width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #a8c4cc",fontSize:13.5,outline:"none",color:"#0C2C55",background:"white",boxSizing:"border-box"}
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#0C2C55"}}>Meal Ideas</h2>
        <button onClick={()=>setShowForm(!showForm)} style={{background:showForm?"#f0e6e0":"#0C2C55",color:showForm?"#7F543D":"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{showForm?"Cancel":"+ Add Meal"}</button>
      </div>
      {showForm&&(
        <div style={{background:"white",border:"1.5px solid #629FAD",borderRadius:14,padding:"16px",marginBottom:16,boxShadow:"0 2px 8px rgba(12,44,85,0.08)"}}>
          <div style={{fontWeight:700,fontSize:15,color:"#0C2C55",marginBottom:12}}>Add a New Meal</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Meal name *" style={inputStyle}/>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Short description" style={inputStyle}/>
            <input value={time} onChange={e=>setTime(e.target.value)} placeholder="Cook time (minutes)" type="number" style={inputStyle}/>
            <input value={ingredients} onChange={e=>setIngredients(e.target.value)} placeholder="Ingredients (comma separated)" style={inputStyle}/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[["🌱 Vegetarian",isVeg,setIsVeg],["🌾 Gluten-Free",isGF,setIsGF],["⚡ GF Adaptable",isGFA,setIsGFA]].map(([label,val,set])=>(
                <button key={label} onClick={()=>set(!val)} style={{background:val?"#0C2C55":"white",color:val?"white":"#0C2C55",border:`1.5px solid ${val?"#0C2C55":"#a8c4cc"}`,borderRadius:99,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{label}</button>
              ))}
            </div>
            <button onClick={saveCustomMeal} disabled={!name.trim()} style={{background:name.trim()?"#0C2C55":"#a8c4cc",color:"white",border:"none",borderRadius:8,padding:"10px",fontWeight:700,cursor:name.trim()?"pointer":"default",fontSize:14}}>Save Meal</button>
          </div>
        </div>
      )}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search meals..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #a8c4cc",fontSize:14,boxSizing:"border-box",marginBottom:12,outline:"none",color:"#0C2C55",background:"white"}}/>
      <div style={{display:"flex",gap:8,marginBottom:16}}>{fb(fv,()=>setFv(!fv),"🌱 Vegetarian only")}{fb(fg,()=>setFg(!fg),"🌾 GF only")}</div>
      <div style={{fontSize:12.5,color:"#629FAD",marginBottom:12}}>{filtered.length} meals{customMeals.length>0&&` · ${customMeals.length} custom`}</div>
      {filtered.map(m=>(
        <div key={m.name} style={{position:"relative"}}>
          <MealCard meal={m}/>
          {m.custom&&<button onClick={()=>deleteCustomMeal(m.name)} style={{position:"absolute",top:8,right:8,background:"#f0e6e0",color:"#7F543D",border:"none",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Delete</button>}
        </div>
      ))}
    </div>
  )
}