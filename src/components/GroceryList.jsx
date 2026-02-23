import { useState } from 'react'
import { CAT_EMOJIS, MANUAL_CATEGORIES } from '../constants'
import { askClaudeJSON } from '../api/claude'
export function GroceryList({ groceryList, setGroceryList, checkedItems, setCheckedItems, grocerySource, pantryItems, storeRouteInfo, setStoreRouteInfo, onRegenerate, plannedCount }) {
  const [mi,setMi]=useState('');const [mc,setMc]=useState('Other');const [cm,setCm]=useState('');const [si,setSi]=useState('');const [sl,setSl]=useState(false);const [sp,setSp]=useState(false)
  const total=Object.values(groceryList).reduce((s,i)=>s+i.length,0)
  const checked=Object.keys(checkedItems).filter(k=>checkedItems[k]).length
  const toggle=(cat,idx)=>setCheckedItems({...checkedItems,[`${cat}-${idx}`]:!checkedItems[`${cat}-${idx}`]})
  const removeItem=(cat,idx)=>{const u={...groceryList};u[cat]=u[cat].filter((_,i)=>i!==idx);if(!u[cat].length)delete u[cat];setGroceryList(u);const n={...checkedItems};delete n[`${cat}-${idx}`];setCheckedItems(n)}
  const addManual=()=>{if(!mi.trim())return;setGroceryList({...groceryList,[mc]:[...(groceryList[mc]||[]),{name:mi.trim(),sources:["added manually"]}]});setMi('')}
  const copyList=()=>{let t=`🛒 HQ Meal Planning${storeRouteInfo?` (${storeRouteInfo.storeName})`:''}\n`;if(grocerySource)t+=`${grocerySource}\n\n`;for(const[cat,items]of Object.entries(groceryList)){t+=`${cat}:\n`;items.forEach(i=>{t+=`  • ${i.name}\n`});t+='\n'};navigator.clipboard.writeText(t).then(()=>{setCm('Copied!');setTimeout(()=>setCm(''),2000)}).catch(()=>{})}
  const route=async()=>{if(!si.trim()||!total)return;setSl(true);const all=Object.values(groceryList).flat();const sm={};all.forEach(item=>{sm[item.name.toLowerCase()]=item.sources||[]});try{const p=await askClaudeJSON(`Shopping at "${si.trim()}". Items: ${all.map(i=>i.name).join(', ')}. Re-organize into efficient walking order. Return ONLY: {"storeName":"...","note":"one tip","sections":[{"label":"...","emoji":"...","items":["..."]}]}`,'You are a grocery store layout expert. Respond ONLY with valid JSON, no markdown.');const r={};p.sections.forEach(sec=>{const key=`${sec.emoji||''} ${sec.label}`.trim();r[key]=sec.items.map(name=>({name,sources:sm[name.toLowerCase()]||[]}))});setGroceryList(r);setCheckedItems({});setStoreRouteInfo({storeName:p.storeName,note:p.note});setSp(false)}catch(e){console.error(e)}setSl(false)}
  if(!total)return <div style={{textAlign:"center",padding:"56px 24px"}}><div style={{fontSize:52,marginBottom:16}}>🛒</div><div style={{fontWeight:700,fontSize:16,color:"#0C2C55",marginBottom:8}}>No grocery list yet</div><div style={{fontSize:14,color:"#629FAD",lineHeight:1.6,maxWidth:320,margin:"0 auto"}}>Go to <strong>Week Planner</strong>, pick your meals, then tap <strong>"Grocery List"</strong>.</div></div>
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#0C2C55"}}>🛒 Grocery List{storeRouteInfo&&<span style={{fontSize:13,fontWeight:500,color:"#629FAD",marginLeft:8}}>— {storeRouteInfo.storeName}</span>}</h2>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setCheckedItems({})} style={{background:"white",color:"#0C2C55",border:"1.5px solid #629FAD",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Uncheck All</button>
          <button onClick={copyList} style={{background:"#0C2C55",color:"white",border:"none",borderRadius:8,padding:"8px 12px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{cm||"📋 Copy"}</button>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        {storeRouteInfo?(
          <div style={{background:"linear-gradient(135deg,#f5ede6,#f0e8de)",border:"1.5px solid #c4956a",borderRadius:12,padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div><div style={{fontWeight:700,fontSize:13.5,color:"#7F543D",marginBottom:3}}>🗺 Optimized for {storeRouteInfo.storeName}</div>{storeRouteInfo.note&&<div style={{fontSize:12.5,color:"#9a6848"}}>{storeRouteInfo.note}</div>}</div>
              <button onClick={()=>setSp(!sp)} style={{background:"#7F543D",color:"white",border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Change Store</button>
            </div>
          </div>
        ):(
          <div style={{background:"linear-gradient(135deg,#d4e4e8,#c8dce0)",border:"1.5px solid #629FAD",borderRadius:12,padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div><div style={{fontWeight:700,fontSize:13.5,color:"#0C2C55",marginBottom:2}}>🗺 Optimize for your store</div><div style={{fontSize:12.5,color:"#296374"}}>Sort by aisle order — shop without backtracking.</div></div>
              <button onClick={()=>setSp(!sp)} style={{background:"#0C2C55",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{sp?"Cancel":"Set Store →"}</button>
            </div>
          </div>
        )}
        {sp&&(
          <div style={{background:"white",border:"1.5px solid #a8c4cc",borderRadius:12,padding:"16px",marginTop:10,boxShadow:"0 4px 16px rgba(12,44,85,0.1)"}}>
            <div style={{fontWeight:700,fontSize:14,color:"#0C2C55",marginBottom:4}}>Which store are you shopping at?</div>
            <div style={{fontSize:12.5,color:"#629FAD",marginBottom:12}}>e.g. "Giant Eagle Westlake Ohio", "Trader Joe's Westlake OH"</div>
            <div style={{display:"flex",gap:8}}>
              <input value={si} onChange={e=>setSi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&route()} placeholder="e.g. Giant Eagle Westlake Ohio" style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1.5px solid #a8c4cc",fontSize:14,outline:"none",color:"#0C2C55"}} autoFocus/>
              <button onClick={route} disabled={sl||!si.trim()} style={{background:si.trim()&&!sl?"#0C2C55":"#a8c4cc",color:"white",border:"none",borderRadius:10,padding:"10px 18px",fontWeight:700,cursor:si.trim()&&!sl?"pointer":"default",fontSize:14,whiteSpace:"nowrap"}}>{sl?"Routing...":"✨ Optimize"}</button>
            </div>
            {sl&&<div style={{marginTop:10,fontSize:13,color:"#629FAD"}}>⏳ Mapping your items to {si}'s aisles...</div>}
            <div style={{marginTop:10,fontSize:12,color:"#a8c4cc"}}>💡 Works with: Giant Eagle, Kroger, Meijer, Walmart, Target, Trader Joe's, Whole Foods, ALDI, Costco & more</div>
          </div>
        )}
      </div>
      {grocerySource&&<div style={{fontSize:12.5,color:"#629FAD",marginBottom:12,fontStyle:"italic"}}>{grocerySource}{pantryItems.length>0&&` · Excluding ${pantryItems.length} pantry item${pantryItems.length>1?"s":""}`}</div>}
      <div style={{background:"#d4e4e8",border:"1.5px solid #629FAD",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:13.5,color:"#0C2C55",fontWeight:700,whiteSpace:"nowrap"}}>{checked}/{total}</span>
        <div style={{flex:1,background:"#a8c4cc",borderRadius:99,height:8,overflow:"hidden"}}><div style={{background:"#0C2C55",height:"100%",width:`${Math.round((checked/total)*100)}%`,borderRadius:99,transition:"width 0.3s"}}/></div>
        <span style={{fontSize:12,color:"#0C2C55",fontWeight:700,whiteSpace:"nowrap"}}>{Math.round((checked/total)*100)}%</span>
      </div>
      {Object.entries(groceryList).map(([category,items],idx)=>{
        const em=(()=>{const m=category.match(/^(\S+)\s/);return m&&/\p{Emoji}/u.test(m[1])?m[1]:(CAT_EMOJIS[category]||"🛒")})()
        const label=em&&category.startsWith(em)?category.slice(em.length).trim():category
        const cc=items.filter((_,i)=>checkedItems[`${category}-${i}`]).length
        const done=cc===items.length
        return (
          <div key={category} style={{background:"white",border:done?"1.5px solid #629FAD":"1.5px solid #a8c4cc",borderRadius:14,marginBottom:12,overflow:"hidden",opacity:done?0.65:1,transition:"all 0.2s",boxShadow:"0 1px 4px rgba(12,44,85,0.06)"}}>
            <div style={{padding:"11px 16px",background:done?"#d4e4e8":"#f0f5f6",borderBottom:`1px solid ${done?"#629FAD":"#dde8ea"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {storeRouteInfo&&<span style={{background:"#0C2C55",color:"white",borderRadius:99,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{idx+1}</span>}
                <span style={{fontWeight:700,fontSize:14,color:done?"#629FAD":"#0C2C55"}}>{em} {label}</span>
              </div>
              <span style={{fontSize:12,color:done?"#629FAD":"#a8c4cc",fontWeight:done?700:400}}>{done?"✓ Done":`${cc}/${items.length}`}</span>
            </div>
            <div style={{padding:"6px 0"}}>
              {items.map((item,i)=>{
                const ck=!!checkedItems[`${category}-${i}`]
                return <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:ck?"#f5f8f9":"white"}}>
                  <div onClick={()=>toggle(category,i)} style={{width:22,height:22,borderRadius:6,flexShrink:0,cursor:"pointer",border:ck?"none":"2px solid #a8c4cc",background:ck?"#0C2C55":"white",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>{ck&&<span style={{color:"white",fontSize:13,fontWeight:900}}>✓</span>}</div>
                  <span onClick={()=>toggle(category,i)} style={{fontSize:14,color:ck?"#a8c4cc":"#0C2C55",textDecoration:ck?"line-through":"none",flex:1,cursor:"pointer"}}>{item.name}</span>
                  {item.sources?.length>0&&!ck&&item.sources[0]!=="added manually"&&<span style={{fontSize:11,color:"#629FAD",textAlign:"right",maxWidth:120,lineHeight:1.3,flexShrink:0}}>{item.sources.slice(0,2).join(", ")}</span>}
                  <button onClick={()=>removeItem(category,i)} style={{background:"none",border:"none",color:"#a8c4cc",fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1}} onMouseEnter={e=>e.target.style.color="#7F543D"} onMouseLeave={e=>e.target.style.color="#a8c4cc"}>×</button>
                </div>
              })}
            </div>
          </div>
        )
      })}
      <div style={{background:"white",border:"1.5px dashed #629FAD",borderRadius:14,padding:"14px 16px",marginBottom:12}}>
        <div style={{fontWeight:600,fontSize:13,color:"#629FAD",marginBottom:10}}>+ Add an item manually</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <input value={mi} onChange={e=>setMi(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManual()} placeholder="e.g. dish soap, paper towels..." style={{flex:1,minWidth:140,padding:"9px 12px",borderRadius:8,border:"1.5px solid #a8c4cc",fontSize:13.5,outline:"none",color:"#0C2C55"}}/>
          <select value={mc} onChange={e=>setMc(e.target.value)} style={{padding:"9px 10px",borderRadius:8,border:"1.5px solid #a8c4cc",fontSize:13,color:"#0C2C55",background:"white",cursor:"pointer",outline:"none"}}>{MANUAL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
          <button onClick={addManual} disabled={!mi.trim()} style={{background:mi.trim()?"#0C2C55":"#a8c4cc",color:"white",border:"none",borderRadius:8,padding:"9px 16px",fontWeight:700,cursor:mi.trim()?"pointer":"default",fontSize:13}}>Add</button>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={onRegenerate} disabled={!plannedCount} style={{background:plannedCount?"#629FAD":"#a8c4cc",color:"white",border:"none",borderRadius:8,padding:"10px 16px",fontWeight:600,cursor:plannedCount?"pointer":"default",fontSize:13}}>🔄 Regenerate</button>
        <button onClick={copyList} style={{background:"#0C2C55",color:"white",border:"none",borderRadius:8,padding:"10px 16px",fontWeight:600,cursor:"pointer",fontSize:13}}>{cm||"📋 Copy to Clipboard"}</button>
      </div>
    </div>
  )
}