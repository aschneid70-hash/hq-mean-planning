import { useState } from 'react'
import { useFamilyData } from './hooks/useFamilyData'
import { PinScreen } from './components/PinScreen'
import { WeekPlanner } from './components/WeekPlanner'
import { PantryTab } from './components/PantryTab'
import { MealIdeasTab } from './components/MealIdeasTab'
import { GroceryList } from './components/GroceryList'
import { categorizeIngredient } from './constants'
import { askClaudeJSON } from './api/claude'
const SK = 'hq-meal-unlocked'
export default function App() {
  const [unlocked,setUnlocked]=useState(()=>sessionStorage.getItem(SK)==='1')
  const [tab,setTab]=useState('planner')
  const [gl,setGl]=useState(false)
  const {weekPlan,setWeekPlan,pantryItems,setPantryItems,groceryList,setGroceryList,checkedItems,setCheckedItems,storeRouteInfo,setStoreRouteInfo,grocerySource,setGrocerySource,loading}=useFamilyData(unlocked)
  const unlock=()=>{sessionStorage.setItem(SK,'1');setUnlocked(true)}
  const buildQ=()=>{
    const meals=Object.values(weekPlan);if(!meals.length)return
    const all={};meals.forEach(meal=>meal.ingredients.forEach(ing=>{const key=ing.toLowerCase();if(!all[key])all[key]={name:ing,sources:[]};all[key].sources.push(meal.name)}))
    const filtered=Object.values(all).filter(item=>!pantryItems.some(p=>item.name.toLowerCase().includes(p)||p.includes(item.name.toLowerCase())))
    const cat={};filtered.forEach(item=>{const c=categorizeIngredient(item.name);if(!cat[c])cat[c]=[];cat[c].push(item)})
    setGroceryList(cat);setCheckedItems({});setStoreRouteInfo(null)
    setGrocerySource(`${meals.length} meal${meals.length>1?'s':''}: ${meals.map(m=>m.name).join(', ')}`)
  }
  const buildA=async()=>{
    const meals=Object.values(weekPlan);if(!meals.length)return
    setGl(true);setGroceryList({})
    const mn=meals.map(m=>m.name).join(', ')
    const pn=pantryItems.length?`Family already has: ${pantryItems.join(', ')}. Do NOT include these.`:''
    try{
      const p=await askClaudeJSON(`Grocery list for family of 5 (2 adults, 3 kids 4/2/2) for: ${mn}. ${pn} Keys=category, values=ingredient strings with quantities. Categories: Produce, Dairy & Eggs, Meat & Seafood, Pantry & Dry Goods, Sauces & Condiments, Spices & Seasonings, Canned & Packaged. Only used categories. Deduplicate. ONLY valid JSON.`)
      const cat={};for(const[c,items] of Object.entries(p))cat[c]=items.map(name=>({name,sources:[]}))
      setGroceryList(cat);setCheckedItems({});setStoreRouteInfo(null)
      setGrocerySource(`AI list for ${meals.length} meals: ${mn}`)
    }catch{buildQ()}finally{setGl(false)}
  }
  if(!unlocked)return <PinScreen onUnlock={unlock}/>
  if(loading)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F5F0EB"}}><div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🍽</div><div style={{fontSize:13,color:"#74A8A4"}}>Loading your family's data...</div></div></div>
  const ti=Object.values(groceryList).reduce((s,i)=>s+i.length,0)
  const cc=Object.keys(checkedItems).filter(k=>checkedItems[k]).length
  const pc=Object.keys(weekPlan).length
  const ts=(t)=>({padding:"8px 15px",border:"none",borderRadius:99,background:tab===t?"#F5F0EB":"transparent",color:tab===t?"#335765":"rgba(245,240,235,0.75)",fontWeight:tab===t?700:500,fontSize:13,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"})
  return (
    <div style={{fontFamily:"'Georgia',serif",minHeight:"100vh",background:"#F5F0EB",paddingBottom:56}}>
      <div style={{background:"linear-gradient(135deg,#335765 0%,#2d4f5c 100%)",padding:"20px 24px 18px",color:"white",boxShadow:"0 2px 12px rgba(51,87,101,0.3)"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontSize:21,fontWeight:800,letterSpacing:"0.5px",color:"#F5F0EB",textTransform:"uppercase"}}>🍽 HQ Meal Planning</div>
              <div style={{fontSize:11.5,color:"#B6D9E0",marginTop:4,letterSpacing:"0.5px"}}>5 people · Wife: vegetarian 🌱 · You & oldest: celiac 🌾</div>
            </div>
            <button onClick={()=>{sessionStorage.removeItem(SK);setUnlocked(false)}} style={{background:"rgba(182,217,224,0.15)",color:"#B6D9E0",border:"1px solid rgba(182,217,224,0.25)",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}}>🔒 Lock</button>
          </div>
          <div style={{display:"flex",gap:2,background:"rgba(51,87,101,0.5)",borderRadius:99,padding:3,overflowX:"auto",width:"fit-content",maxWidth:"100%",border:"1px solid rgba(182,217,224,0.2)"}}>
            {[["planner","📅 Week"],["pantry","🧺 Pantry"],["ideas","💡 Ideas"],["grocery",`🛒 Grocery${ti>0?` (${cc}/${ti})`:''}`]].map(([key,label])=>(
              <button key={key} onClick={()=>setTab(key)} style={ts(key)}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{height:3,background:"linear-gradient(90deg,#74A8A4,#B6D9E0,#DBE2DC)"}}/>
      <div style={{maxWidth:680,margin:"24px auto 0",padding:"0 16px"}}>
        {gl&&tab==='grocery'&&(
          <div style={{textAlign:"center",padding:"56px 0"}}>
            <div style={{fontSize:40,marginBottom:14}}>🛒</div>
            <div style={{fontWeight:700,fontSize:16,color:"#335765",marginBottom:6}}>Building your grocery list...</div>
            <div style={{fontSize:13,color:"#74A8A4"}}>AI is calculating quantities for your family of 5</div>
          </div>
        )}
        {!gl&&<>
          {tab==='planner'&&<WeekPlanner weekPlan={weekPlan} setWeekPlan={setWeekPlan} pantryItems={pantryItems} onBuildAiList={buildA} onBuildQuickList={buildQ} switchToGrocery={()=>setTab('grocery')}/>}
          {tab==='pantry'&&<PantryTab pantryItems={pantryItems} setPantryItems={setPantryItems}/>}
          {tab==='ideas'&&<MealIdeasTab/>}
          {tab==='grocery'&&!gl&&<GroceryList groceryList={groceryList} setGroceryList={setGroceryList} checkedItems={checkedItems} setCheckedItems={setCheckedItems} grocerySource={grocerySource} pantryItems={pantryItems} storeRouteInfo={storeRouteInfo} setStoreRouteInfo={setStoreRouteInfo} onRegenerate={buildA} plannedCount={pc}/>}
        </>}
      </div>
    </div>
  )
}