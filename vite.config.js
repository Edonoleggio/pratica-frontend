import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// ── Versione/build derivati AUTOMATICAMENTE ──────────────────────────────
// La data e il commit NON vanno più scritti a mano in APP_VERSION: si
// dimenticano e l'etichetta "mente" (è successo davvero: ferma al 2026-05-29
// per settimane mentre l'app continuava a cambiare). Qui vengono iniettati a
// ogni build, così "build del …" dice sempre la verità.
function gitCommit() {
  // Su Render è disponibile RENDER_GIT_COMMIT; in locale si legge da git.
  if (process.env.RENDER_GIT_COMMIT) return process.env.RENDER_GIT_COMMIT.slice(0, 7)
  try { return execSync('git rev-parse --short HEAD').toString().trim() } catch { return 'dev' }
}
function buildDate() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD_DATE__: JSON.stringify(buildDate()),
    __APP_COMMIT__: JSON.stringify(gitCommit()),
  },
})
