import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db, FAMILY_DOC_ID } from '../firebase'
const COLLECTION = 'hq-meal-planning'
function useDebounce(fn, delay = 800) {
  const timer = useRef(null)
  return (...args) => { clearTimeout(timer.current); timer.current = setTimeout(() => fn(...args), delay) }
}
export function useFamilyData(unlocked) {
  const [weekPlan, setWeekPlanLocal] = useState({})
  const [pantryItems, setPantryItemsLocal] = useState([])
  const [groceryList, setGroceryListLocal] = useState({})
  const [checkedItems, setCheckedItemsLocal] = useState({})
  const [storeRouteInfo, setStoreRouteInfoLocal] = useState(null)
  const [grocerySource, setGrocerySourceLocal] = useState('')
  const [loading, setLoading] = useState(true)
  const docRef = doc(db, COLLECTION, FAMILY_DOC_ID)
  const save = (patch) => {
    console.log('Saving to Firestore:', patch)
    return setDoc(docRef, patch, { merge: true }).catch(e => console.error('Firestore save error:', e))
  }
  const debouncedSave = useDebounce(save, 600)
  useEffect(() => {
    if (!unlocked) { setLoading(false); return }
    console.log('Starting Firestore listener...')
    const unsub = onSnapshot(docRef, (snap) => {
      console.log('Firestore snapshot received, exists:', snap.exists())
      if (snap.exists()) {
        const d = snap.data()
        console.log('Data from Firestore:', d)
        setWeekPlanLocal(d.weekPlan || {})
        setPantryItemsLocal(d.pantryItems || [])
        setGroceryListLocal(d.groceryList || {})
        setCheckedItemsLocal(d.checkedItems || {})
        setStoreRouteInfoLocal(d.storeRouteInfo || null)
        setGrocerySourceLocal(d.grocerySource || '')
      }
      setLoading(false)
    }, (err) => { console.error('Firestore listener error:', err); setLoading(false) })
    return () => unsub()
  }, [unlocked])
  const setWeekPlan = (u) => { setWeekPlanLocal(prev => { const next = typeof u === 'function' ? u(prev) : u; console.log('setWeekPlan called, saving:', next); debouncedSave({ weekPlan: next }); return next }) }
  const setPantryItems = (v) => { setPantryItemsLocal(v); debouncedSave({ pantryItems: v }) }
  const setGroceryList = (v) => { setGroceryListLocal(v); debouncedSave({ groceryList: v }) }
  const setCheckedItems = (v) => { setCheckedItemsLocal(v); debouncedSave({ checkedItems: v }) }
  const setStoreRouteInfo = (v) => { setStoreRouteInfoLocal(v); debouncedSave({ storeRouteInfo: v }) }
  const setGrocerySource = (v) => { setGrocerySourceLocal(v); debouncedSave({ grocerySource: v }) }
  return { weekPlan, setWeekPlan, pantryItems, setPantryItems, groceryList, setGroceryList, checkedItems, setCheckedItems, storeRouteInfo, setStoreRouteInfo, grocerySource, setGrocerySource, loading }
}