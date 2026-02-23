import { useState } from 'react'
const CORRECT_PIN = import.meta.env.VITE_FAMILY_PIN || '1234'
export function PinScreen({ onUnlock }) {
  const [pin,setPin]=useState('');const [error,setError]=useState(false);const [shake,setShake]=useState(false)
  const handleDigit=(d)=>{if(pin.length>=4)return;const next=pin+d;setPin(next);setError(false);if(next.length===4){if(next===CORRECT_PIN){setTimeout(onUnlock,200)}else{setShake(true);setError(true);setTimeout(()=>{setPin('');setShake(false)},600)}}}
  const handleBack=()=>{setPin(p=>p.slice(0,-1));setError(false)}
  const dots=Array.from({length:4},(_,i)=>i<pin.length)
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,#0C2C55 0%,#1a3f6e 60%,#296374 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{position:"fixed",top:0,left:0,right:0,height:6,background:"#629FAD",opacity:0.8}}/>
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{fontSize:52,marginBottom:14}}>🍽</div>
        <h1 style={{color:"#EDEDCE",fontSize:28,fontWeight:800,letterSpacing:"0.5px",marginBottom:8,textTransform:"uppercase"}}>HQ Meal Planning</h1>
        <p style={{color:"#629FAD",fontSize:13,letterSpacing:"1px",textTransform:"uppercase"}}>Enter Family PIN</p>
      </div>
      <div style={{display:"flex",gap:18,marginBottom:44,animation:shake?"shake 0.5s ease":"none"}}>
        {dots.map((filled,i)=><div key={i} style={{width:16,height:16,borderRadius:"50%",background:filled?"#629FAD":"transparent",border:`2px solid ${error?"#c0846a":"#629FAD"}`,transition:"all 0.15s",boxShadow:filled?"0 0 8px rgba(98,159,173,0.6)":"none"}}/>)}
      </div>
      {error&&<div style={{color:"#c0846a",fontSize:13,marginBottom:20,marginTop:-32}}>Incorrect PIN — try again</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:228}}>
        {[1,2,3,4,5,6,7,8,9].map(d=>(
          <button key={d} onClick={()=>handleDigit(String(d))} style={{height:62,borderRadius:14,border:"1.5px solid rgba(98,159,173,0.3)",background:"rgba(98,159,173,0.1)",color:"#EDEDCE",fontSize:22,fontWeight:600,cursor:"pointer"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(98,159,173,0.25)";e.currentTarget.style.borderColor="#629FAD"}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(98,159,173,0.1)";e.currentTarget.style.borderColor="rgba(98,159,173,0.3)"}}
          >{d}</button>
        ))}
        <div/>
        <button onClick={()=>handleDigit('0')} style={{height:62,borderRadius:14,border:"1.5px solid rgba(98,159,173,0.3)",background:"rgba(98,159,173,0.1)",color:"#EDEDCE",fontSize:22,fontWeight:600,cursor:"pointer"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(98,159,173,0.25)";e.currentTarget.style.borderColor="#629FAD"}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(98,159,173,0.1)";e.currentTarget.style.borderColor="rgba(98,159,173,0.3)"}}
        >0</button>
        <button onClick={handleBack} style={{height:62,borderRadius:14,border:"none",background:"transparent",color:"rgba(98,159,173,0.6)",fontSize:20,cursor:"pointer"}}>⌫</button>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}`}</style>
    </div>
  )
}