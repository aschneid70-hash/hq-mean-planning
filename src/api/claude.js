const SYSTEM = `You are a helpful family meal planner. The family has 5 members: 2 parents and 3 daughters ages 4, 2, and 2. The wife is vegetarian. The father and oldest daughter (age 4) have celiac disease. Keep meals kid-friendly. Be warm, practical, concise.`

const SYSTEM_JSON = `${SYSTEM} When asked to return JSON, respond with only valid JSON — no markdown, no code fences, no preamble, no explanation. Just raw JSON.`

export async function askClaude(prompt, systemOverride) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemOverride || SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    }),
  })
  if (!res.ok) throw new Error(`Claude API ${res.status}`)
  const data = await res.json()
  return data.content?.map(c => c.text || '').join('\n') || ''
}

export async function askClaudeJSON(prompt, systemOverride) {
  const text = await askClaude(prompt, systemOverride || SYSTEM_JSON)
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()
  const start = cleaned.search(/[\[{]/)
  const end = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'))
  if (start === -1 || end === -1) throw new Error('No JSON found in response')
  return JSON.parse(cleaned.slice(start, end + 1))
}
