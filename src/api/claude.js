const SYSTEM = `You are a helpful family meal planner. The family has 5 members: 2 parents and 3 daughters ages 4, 2, and 2. The wife is vegetarian. The father and oldest daughter (age 4) have celiac disease. Keep meals kid-friendly. Be warm, practical, concise.`
export async function askClaude(prompt, systemOverride) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, system: systemOverride || SYSTEM, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}`)
  const data = await res.json()
  return data.content?.map(c => c.text || '').join('\n') || ''
}
export async function askClaudeJSON(prompt, systemOverride) {
  const text = await askClaude(prompt, systemOverride || 'Respond with only valid JSON, no markdown, no preamble.')
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}
