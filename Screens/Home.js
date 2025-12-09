import React, { useEffect, useContext, useState } from 'react'
import { StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import ListProfils from './ListProfils'
import MyProfil from './MyProfil'
import Icon from 'react-native-vector-icons/MaterialIcons'
import firebase from '../config'

const auth = firebase.auth()
const database = firebase.database()
const ref_tableProfils = database.ref('Tabledeprofils')

const Tab = createBottomTabNavigator()

export default function Home({ route }) {
  const currentid = auth.currentUser.uid
  const [profileExist, setProfileExist] = useState(true)

  useEffect(() => {
    const userProfileRef = ref_tableProfils.child(`unprofil${currentid}`)
    userProfileRef.on('value', (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setProfileExist(true)
      } else {
        setProfileExist(false)
      }
    })

    return () => userProfileRef.off()
  }, [])

  return (
    <>
      {profileExist ? (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen
            name='Profils'
            component={ListProfils}
            initialParams={{ currentid }}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name='people' color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name='My Profil'
            component={MyProfil}
            initialParams={{ currentid }}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name='person' color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      ) : (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen
            name='My Profil'
            component={MyProfil}
            initialParams={{ currentid }}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name='person' color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
