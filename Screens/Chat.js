import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  ImageBackground
} from "react-native";
import { StatusBar } from "expo-status-bar";
import firebase from "../config/index"; 
import { SafeAreaView } from "react-native-safe-area-context";
import supabase from "../config/supa"; 
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabaseUrl } from "../config/supa";

const reflesdiscussions = firebase.database().ref("lesdiscussions");
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native";
import { useRoute } from '@react-navigation/native';

export default function Chat(props) {
  const route = useRoute();
  const { currentUser, secondUser } = route.params; // Get passed profiles
  const [profileImage, setProfileImage] = useState(null);


  useEffect(() => {
    if (secondUser && secondUser.uriImage) {
      setProfileImage(secondUser.uriImage);
    }
  }, [secondUser]);
  const navigation = useNavigation();
  const onBackPress = () => {
    navigation.goBack();
  };
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const userId = props.route?.params?.currentUser.id;
  const profile = props.route?.params?.secondUser;
  const iddisc =
    userId > profile.id ? userId + profile.id : profile.id + userId;
  const ref_unediscussion = reflesdiscussions.child(iddisc);
  const [isTyping, setIsTyping] = useState(false); 
  const [otherTyping, setOtherTyping] = useState(false); 


  useEffect(() => {
    ref_unediscussion.on("value", (snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((child) => {
        if (child.key !== "typing") {
          fetchedMessages.push({ id: child.key, ...child.val() });
        }
      });
      setMessages(fetchedMessages.reverse());
    });

    return () => ref_unediscussion.off();
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[0];
    if (lastMessage.receiver === userId && !lastMessage.seen?.status) {
      const messageRef = ref_unediscussion.child(lastMessage.id);
      messageRef.update({
        seen: {
          status: true,
          time: new Date().toISOString(),
        },
      });
    }
  }, [messages]);
  

  
  useEffect(() => {
    const typingRef = ref_unediscussion.child("typing").child(profile.id);
    typingRef.on("value", (snapshot) => {
      setOtherTyping(snapshot.val()); 
    });

    return () => typingRef.off();
  }, []);

  //typing keen length >0 thotlou set w ref true 
  const handleInput = (text) => {
    setInputText(text);
    const typingRef = ref_unediscussion.child("typing").child(userId);
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      typingRef.set(true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      typingRef.set(false);
    }
  };

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const key = ref_unediscussion.push().key;
    const ref_unediscussion_key = ref_unediscussion.child(key);
    const newMessage = {
      id: key,
      text: inputText,
      sender: userId, 
      date: new Date().toISOString(),
      receiver: profile.id,
      type: "text",
      seen: {
        status: false,
        time: null,
      },
    };

    ref_unediscussion_key.set(newMessage);
    setInputText("");
    const typingRef = ref_unediscussion.child("typing").child(userId);
    typingRef.set(false);
    setIsTyping(false);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === userId;

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
          (item.type === "image") && {
            backgroundColor: "transparent",
          },
        ]}
      >
        {item.type === "text" ? (
          <Text style={styles.messageText}>{item.text}</Text>
        ) : (
          <TouchableOpacity
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.imageMessage}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = 
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to your media library to select an image."
        );
        return;
      }
      const result = 
       await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });   

      if (!result.canceled) {
        const uri = result.assets[0].base64;
        if (!uri) throw new Error("Failed to get image base64 data.");
        await uploadImageSupa(uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const uploadImageSupa = async (uri) => {
    try {
      const key = ref_unediscussion.push().key;
      const ref_unediscussion_key = ref_unediscussion.child(key);
      const fileName = `${key}.jpg`; 

      const { data, error } = await supabase.storage
        .from("sent-images") 
        .upload(fileName, decode(uri), { contentType: "image/jpeg" });

      if (error) {
        console.log("h4")
        console.log(error);
        throw error;
      }

      const imageUrl =
        supabaseUrl +
        "/storage/v1/object/public/" +
        data.fullPath;

      const newMessage = {
        id: key,
        imageUrl: imageUrl,
        sender: userId, 
        date: new Date().toISOString(),
        receiver: profile.id,
        type: "image"
      };

      ref_unediscussion_key.set(newMessage);
      
    } catch (error) {
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.profileSection}>
      <Image
          source={{
            uri: profileImage || require('../assets/profil.png'),  
          }}
          style={styles.profileImage}
        />
    <Text style={styles.headerText}>Chat with {profile.nom}</Text>
  </View>
</View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexGrow}
        >
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted
          />

          
          {
            //Fama au moins message f list + aikher msg mtaa user + seen status vrai
            messages.length > 0 &&
            messages[0].sender === userId &&
            messages[0].seen?.status && (
              <Text style={styles.seenStatus}>
                Seen at {new Date(messages[0].seen?.time).toLocaleTimeString()}
              </Text>
            )}

          {otherTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Typing...</Text>
            </View>
          )}
          <View style={styles.inputContainer}>
          <TouchableOpacity
      onPress={handleImagePick}
      style={styles.uploadButton}
    >
      <Ionicons name="image" size={30} color="#000" style={styles.uploadButtonIcon} />
    </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a msg"
              value={inputText}
              onChangeText={handleInput}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b0b0b0",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },
  flexGrow: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#800040",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#800040",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "gray",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: "#ddd",
    backgroundColor: "#b0b0b0",
    

  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#800040",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  typingIndicator: {
    alignSelf: "flex-start",
    marginLeft: 10,
    marginBottom: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 15,
  },
  typingText: {
    color: "#666",
    fontStyle: "italic",
  },
  
  backButton: {
    padding: 10,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ccc", 
  },
  pseudoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  nameText: {
    color: "#e0e0e0", 
    fontSize: 14,
  },

  uploadButton: {
    marginRight: 10,
    backgroundColor: "#ddd",
    borderRadius: 20,
    padding: 7,
  },
  uploadButtonText: {
    fontSize: 18,
  },
  
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 50,
    padding: 10,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#000",
  },
 
  seenStatus: {
    fontSize: 12,
    color: "black",
    textAlign: "right",
    marginTop: -15,
    marginRight: 15,
  },
  
});