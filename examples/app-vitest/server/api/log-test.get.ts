export default defineEventHandler(() => {
  console.log('[test] server-log-marker')
  return { ok: true }
})
