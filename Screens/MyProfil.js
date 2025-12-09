import React, { useState, useEffect } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  Alert,
  View,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import firebase from '../config/index'
import supabase from '../config/supa'
import { useNavigation } from '@react-navigation/native'
import { decode } from 'base64-arraybuffer'
import { supabaseUrl } from '../config/supa'
import Icon from 'react-native-vector-icons/Ionicons'

const auth = firebase.auth()
const database = firebase.database()
const ref_tableProfils = database.ref('Tabledeprofils')

export default function MyProfil(props) {
  const [uriImage, setUriImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [nom, setNom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [telephone, setTelephone] = useState('')
  const [currentid, setCurrentid] = useState(auth.currentUser.uid)
  const navigation = useNavigation()
  const [base64, setBase64] = useState('')

  useEffect(() => {
    const userProfileRef = ref_tableProfils.child(`unprofil${currentid}`)
    userProfileRef.on('value', (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setNom(data.nom || '')
        setPseudo(data.pseudo || '')
        setTelephone(data.telephone || '')
        if (data.uriImage) {
          setUriImage(data.uriImage)
        }
      }
    })

    return () => userProfileRef.off()
  }, [])

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'We need access to your photo library to select images.'
        )
      }
    }

    requestPermissions()
  }, [])

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      })

      if (!result.canceled) {
        setUriImage(result.assets[0].uri)
        setBase64(result.assets[0].base64)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image.')
    }
  }

  const uploadImageToSupabase = async (uri) => {
    try {
      const fileName = `${currentid}-${Date.now()}`.jpg
      const { data, error } = await supabase.storage
        .from('ProfileImage')
        .upload(fileName, decode(uri), { contentType: 'image/jpeg' })

      if (error) {
        console.log(error)
        throw error
      }

      const imageUrl =
        supabaseUrl + '/storage/v1/object/public/' + data.fullPath

      setUriImage(imageUrl)
    } catch (error) {
      console.log(error)
    }
  }

  const saveProfile = async () => {
    try {
      let imageUrl = null

      if (base64) {
        await uploadImageToSupabase(base64)
      }

      const ref_unprofil = ref_tableProfils.child(`unprofil${currentid}`)
      await ref_unprofil.set({
        id: currentid,
        nom,
        pseudo,
        telephone,
        uriImage: uriImage || '',
      })

      Alert.alert('Success', 'Profile saved successfully!')
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile data.')
    }
  }

  const handleDisconnect = () => {
    auth.signOut()
    navigation.replace('auth')

    const userProfileRef = ref_tableProfils.child(`unprofil${currentid}`)
    if (userProfileRef) {
      userProfileRef.update({ isConnected: false })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Text style={styles.label}>
        <Icon name='person' size={20} color='#fff' /> Name
      </Text>
      <TextInput
        style={styles.input}
        value={nom}
        onChangeText={setNom}
        placeholder='Enter your name'
        placeholderTextColor='#aaa'
      />

      <Text style={styles.label}>
        <Icon name='create-outline' size={20} color='#fff' /> Nickname
      </Text>
      <TextInput
        style={styles.input}
        value={pseudo}
        onChangeText={setPseudo}
        placeholder='Enter your Nickname'
        placeholderTextColor='#aaa'
      />

      <Text style={styles.label}>
        <Icon name='call' size={20} color='#fff' /> Phone
      </Text>
      <TextInput
        style={styles.input}
        value={telephone}
        onChangeText={setTelephone}
        placeholder='Enter your phone number'
        placeholderTextColor='#aaa'
        keyboardType='phone-pad'
      />
      <View style={styles.spacing} />

      <TouchableHighlight onPress={pickImage} underlayColor='transparent'>
        <View style={styles.pickImageContainer}>
          <Icon name='add-circle-outline' size={30} color='#fff' />
          <Text style={styles.pickImageText}>Change Image</Text>
        </View>
      </TouchableHighlight>

      {uriImage && (
        <Image source={{ uri: uriImage }} style={styles.imagePreview} />
      )}

      {uploading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size='large' color='#800040' />
          <Text>Uploading... {Math.round(uploadProgress)}%</Text>
        </View>
      )}

      <View style={styles.spacing} />

      <TouchableHighlight
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={saveProfile}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          <Icon name='save' size={20} color='#fff' /> Save Profil
        </Text>
      </TouchableHighlight>

      <TouchableHighlight
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleDisconnect}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          <Icon name='log-out' size={20} color='#fff' /> Logout
        </Text>
      </TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontFamily: 'Cochin',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: '60%',
    height: 50,
    backgroundColor: '#800040',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 30,
    marginBottom: 10,
    borderColor:'#ccc',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  pickImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  pickImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  spacing: {
    height: 20,
  },
})
