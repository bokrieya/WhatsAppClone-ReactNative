import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from '../config/index';
import Icon from 'react-native-vector-icons/Ionicons';
const auth = firebase.auth();
const database = firebase.database();
const ref_tableProfils = database.ref('Tabledeprofils');

export default function ListProfils(props) {
  const currentid = props.route.params?.currentid;
  const [data, setData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    ref_tableProfils.on('value', (snapshot) => {
      const profiles = [];
      snapshot.forEach((unprofil) => {
        const profile = unprofil.val();
        if (profile.id === currentid) {
          setCurrentUser(profile);
        } else {
          profiles.push(profile);
        }
      });
      setData(profiles);
    });

    return () => {
      ref_tableProfils.off();
    };
  }, [currentid]);

  const handleDisconnect = () => {
    auth.signOut();
    navigation.replace('auth');

    const userProfileRef = ref_tableProfils.child(`unprofil${currentid}`);
    if (userProfileRef) {
      userProfileRef.update({ isConnected: false });
    }
  };

  return (
    <ImageBackground
      source={require('../assets/back2.jpeg')}
      style={styles.container}
      resizeMode='cover'
    >
      <StatusBar style='light' />
      <View style={styles.statusBar} />
      <View style={styles.spacing} />
      <Text style={styles.title}>List of Profiles</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('chat', {
                currentUser,
                secondUser: item,
              });
            }}
            style={styles.profileCard}
          >
            <View style={styles.profileImageWrapper}>
              <Image
                source={{
                  uri: item.uriImage || require('../assets/profil.png'),
                }}
                style={styles.profileImage}
              />
            </View>
            <Text style={styles.profileText}>
              {item.nom ? `${item.nom} ${item.pseudo}` : 'Unknown User'}
            </Text>
          </TouchableOpacity>
        )}
        style={{ width: '100%' }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <TouchableHighlight
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={handleDisconnect}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          <Icon name='log-out' size={20} color='#fff' /> Logout
        </Text>
      </TouchableHighlight>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'flex-start',
    //paddingTop: 5,
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    marginBottom: 20,
  },
  button: {
    width: '30%',
    height: 50,
    backgroundColor: '#800040',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  statusBar: { height: 45, width: '100%', backgroundColor: '#800040' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffd0', // Slight transparency
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'center',
    position: 'relative',
  },
  spacing: {
    height: 20,
  },
  profileImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 50 / 2, 
    backgroundColor: '#800040', 
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2, 
    backgroundColor: '#ddd', 
  },
  profileText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#333',
    container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'flex-start',
    //paddingTop: 5,
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
    marginBottom: 20,
  },
  button: {
    width: '30%',
    height: 50,
    backgroundColor: '#800040',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  statusBar: { height: 45, width: '100%', backgroundColor: '#800040' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffd0', // Slight transparency
    borderRadius: 15,
    marginBottom: 20,
    padding: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'center',
    position: 'relative',
  },
  spacing: {
    height: 20,
  },
  profileImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 50 / 2, 
    backgroundColor: '#800040', 
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2, 
    backgroundColor: '#ddd', 
  },
  profileText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#333',
    flex: 1,
  },
    flex: 1,
  },
});
