import { StatusBar } from 'expo-status-bar'
import React, { useState, useRef } from 'react'
import firebase from '../config'
const auth = firebase.auth()

import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native'

export default function Authentification({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const passwordInputRef = useRef(null)

  const handleSignIn = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'acc' }],
        })
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <View style={styles.statusBar} />

      <ImageBackground
        style={styles.backgroundImage}
        source={require('../assets/back.jpg')}
      >
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome WhatsApp</Text>

          <TextInput
            style={styles.input}
            placeholder='Email'
            placeholderTextColor='#ccc'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            returnKeyType='next'
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />

          <TextInput
            style={styles.input}
            placeholder='Password'
            placeholderTextColor='#ccc'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            ref={passwordInputRef}
          />

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text
              style={styles.secondaryButtonText}
              onPress={() => navigation.navigate('newuser')}
            >
              Create New Account
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'flex-start' },
  statusBar: { height: 45, width: '100%', backgroundColor: '#800040' },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  authContainer: {
    alignItems: 'center',
    backgroundColor: '#0009',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '85%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Cochin',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '90%',
    backgroundColor: '#800040',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { marginTop: 10, padding: 10 },
  secondaryButtonText: {
    color: '#800040',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
})
