import { initializeApp } from 'firebase/app'
import { initializeAnalytics, isSupported, logEvent } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const analyticsPromise = firebaseConfig.measurementId
  ? isSupported()
      .then((supported) => {
        if (!supported) return null

        return initializeAnalytics(app, {
          config: { send_page_view: false },
        })
      })
      .catch(() => null)
  : Promise.resolve(null)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const logPageView = (path) => {
  analyticsPromise.then((analytics) => {
    if (!analytics) return

    logEvent(analytics, 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    })
  })
}

googleProvider.setCustomParameters({
  prompt: 'select_account',
})
