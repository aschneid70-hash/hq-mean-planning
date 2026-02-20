export const MEAL_IDEAS = [
  { name: "Veggie Tacos", tags: ["vegetarian", "gluten-free-adaptable"], time: 25, description: "Black bean & cheese tacos — use corn tortillas for GF", ingredients: ["black beans", "corn tortillas", "cheese", "salsa", "avocado"] },
  { name: "Stir-Fried Rice & Veggies", tags: ["vegetarian", "gluten-free"], time: 30, description: "Fried rice with eggs and veggies — use tamari instead of soy sauce", ingredients: ["rice", "eggs", "tamari", "carrots", "peas", "onion", "garlic"] },
  { name: "Spaghetti with Marinara", tags: ["vegetarian", "gluten-free"], time: 30, description: "Family classic — use GF pasta for everyone", ingredients: ["gluten-free pasta", "canned tomatoes", "garlic", "onion", "olive oil", "basil"] },
  { name: "Loaded Baked Potatoes", tags: ["vegetarian", "gluten-free"], time: 50, description: "Bar-style toppings — naturally GF and customizable", ingredients: ["potatoes", "cheese", "sour cream", "broccoli", "butter"] },
  { name: "Cheese Quesadillas", tags: ["vegetarian", "gluten-free-adaptable"], time: 15, description: "Use corn tortillas for GF — add beans or veggies", ingredients: ["corn tortillas", "cheese", "black beans", "salsa"] },
  { name: "Veggie Curry & Rice", tags: ["vegetarian", "gluten-free"], time: 40, description: "Mild coconut curry — naturally GF, kids love it", ingredients: ["chickpeas", "coconut milk", "canned tomatoes", "rice", "curry powder", "onion", "garlic"] },
  { name: "Sheet Pan Salmon & Veggies", tags: ["gluten-free"], time: 35, description: "Wife has just the veggies — simple one-pan dinner", ingredients: ["salmon fillets", "broccoli", "potatoes", "olive oil", "lemon", "garlic"] },
  { name: "Taco Bowls", tags: ["gluten-free"], time: 30, description: "Rice base, beans for wife, beef for others", ingredients: ["rice", "ground beef", "black beans", "corn", "cheese", "salsa", "sour cream"] },
  { name: "Veggie Pizza", tags: ["vegetarian", "gluten-free-adaptable"], time: 35, description: "Use GF crust for celiacs — kids love building their own", ingredients: ["gluten-free pizza crust", "marinara sauce", "mozzarella cheese", "bell peppers", "mushrooms", "onion"] },
  { name: "Egg Fried Rice", tags: ["vegetarian", "gluten-free"], time: 20, description: "Quick weeknight staple — use tamari for GF", ingredients: ["rice", "eggs", "peas", "carrots", "tamari", "sesame oil", "green onion"] },
  { name: "Bean & Cheese Burritos", tags: ["vegetarian", "gluten-free-adaptable"], time: 20, description: "Use GF tortillas or serve as bowls for celiacs", ingredients: ["gluten-free tortillas", "black beans", "cheese", "rice", "salsa"] },
  { name: "Minestrone Soup", tags: ["vegetarian", "gluten-free"], time: 45, description: "Hearty veggie soup — add GF pasta to make it filling", ingredients: ["zucchini", "carrots", "canned tomatoes", "cannellini beans", "onion", "garlic", "gluten-free pasta"] },
  { name: "Chicken Fajita Bowls", tags: ["gluten-free"], time: 30, description: "Serve over rice for GF — wife gets a veggie version", ingredients: ["chicken breast", "bell peppers", "onion", "rice", "cumin", "lime", "cheese"] },
  { name: "Shakshuka", tags: ["vegetarian", "gluten-free"], time: 25, description: "Eggs poached in spiced tomato sauce — naturally GF", ingredients: ["eggs", "canned tomatoes", "bell peppers", "onion", "garlic", "cumin", "paprika"] },
]
export const GROCERY_CATEGORIES = {
  "Produce": ["carrots","broccoli","potatoes","onion","garlic","avocado","zucchini","bell peppers","mushrooms","lemon","lime","green onion","basil"],
  "Dairy & Eggs": ["cheese","sour cream","butter","eggs","mozzarella cheese"],
  "Meat & Seafood": ["salmon fillets","ground beef","chicken breast"],
  "Pantry & Dry Goods": ["rice","gluten-free pasta","gluten-free pizza crust","gluten-free tortillas","corn tortillas","black beans","chickpeas","cannellini beans","corn","peas"],
  "Sauces & Condiments": ["salsa","marinara sauce","tamari","sesame oil","olive oil"],
  "Spices & Seasonings": ["curry powder","cumin","paprika"],
  "Canned & Packaged": ["canned tomatoes","coconut milk"],
}
export const CAT_EMOJIS = {
  "Produce":"🥦","Dairy & Eggs":"🥚","Meat & Seafood":"🥩","Pantry & Dry Goods":"🫙",
  "Sauces & Condiments":"🧴","Spices & Seasonings":"🧂","Canned & Packaged":"🥫",
  "Frozen":"🧊","Bakery":"🍞","Deli":"🧀","Beverages":"🥤","Snacks":"🍿","Household":"🧹","Other":"🛒",
}
export const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
export const MANUAL_CATEGORIES = ["Produce","Dairy & Eggs","Meat & Seafood","Pantry & Dry Goods","Sauces & Condiments","Spices & Seasonings","Canned & Packaged","Other"]
export function categorizeIngredient(ingredient) {
  const ing = ingredient.toLowerCase()
  for (const [cat, items] of Object.entries(GROCERY_CATEGORIES)) {
    if (items.some(i => ing.includes(i) || i.includes(ing))) return cat
  }
  return "Other"
}
