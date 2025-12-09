import app from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import 'firebase/compat/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyD1L5Y0KSxGJ-H6bTE3YOV4CgNXFszif2k',
  authDomain: 'whatsapp-aede1.firebaseapp.com',
  databaseURL: 'https://whatsapp-aede1-default-rtdb.firebaseio.com',
  projectId: 'whatsapp-aede1',
  storageBucket: 'whatsapp-aede1.firebasestorage.app',
  messagingSenderId: '80807772440',
  appId: '1:80807772440:web:d4652cfa3b4b7191ba5e6d',
  measurementId: 'G-BJMK3JREGN',
}

const initApp = app.initializeApp(firebaseConfig)
console.log('init')

export default initApp
