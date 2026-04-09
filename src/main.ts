import '@/assets/main.css'
import 'leaflet/dist/leaflet.css'

import { createApp } from 'vue'

import App from '@/App.vue'
import { registerGlobalErrorHandling } from '@core/error-handling/registerGlobalErrorHandling'
import { registerCorePlugins } from '@core/plugins'
import { useSessionStore } from '@core/stores/session'
import { useI18n } from '@shared/composables/useI18n'
import { useTheme } from '@shared/composables/useTheme'

const app = createApp(App)
const { session, restore } = useSessionStore()
const { ensureApplied } = useTheme()
const { syncLocaleWithSession } = useI18n()

restore()
syncLocaleWithSession(session)
ensureApplied()

registerGlobalErrorHandling(app)
registerCorePlugins(app)
app.mount('#app')
