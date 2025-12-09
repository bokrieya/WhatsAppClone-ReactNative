import Authentication from './Screens/Authentification'
import Home from './Screens/Home'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import NewUser from './Screens/NewUser'
import Chat from './Screens/Chat'
import MyProfil from './Screens/MyProfil'
import ListProfils from './Screens/ListProfils'
export default function App() {
  const Stack = createNativeStackNavigator()
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='newuser' component={NewUser} />
        <Stack.Screen name='chat' component={Chat} />
        <Stack.Screen name='auth' component={Authentication} />
        <Stack.Screen name='acc' component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
