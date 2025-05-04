import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.accessToken) {
        await AsyncStorage.setItem("accessToken", data.accessToken);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Login Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0369a1", "#0284c7", "#0ea5e9"]}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          {/* App Logo */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="checkmark-done" size={40} color="white" />
            </View>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: "white" }}>
              TaskFlow
            </Text>
            <Text
              style={{
                color: "white",
                marginTop: 4,
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                fontSize: 14,
              }}
            >
              Master Your Day
            </Text>
          </View>

          {/* Login Form */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 20, fontWeight: "600", marginBottom: 20 }}>
              Sign In
            </Text>

            {/* Username Field */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "white", marginBottom: 6 }}>Username</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "rgba(255,255,255,0.3)",
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Ionicons name="person-outline" size={20} color="white" />
                <TextInput
                  style={{
                    flex: 1,
                    color: "white",
                    paddingVertical: 10,
                    paddingLeft: 10,
                  }}
                  placeholder="Enter username"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: "white", marginBottom: 6 }}>Password</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "rgba(255,255,255,0.3)",
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Ionicons name="lock-closed-outline" size={20} color="white" />
                <TextInput
                  style={{
                    flex: 1,
                    color: "white",
                    paddingVertical: 10,
                    paddingLeft: 10,
                  }}
                  placeholder="Enter password"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 20 }}>
              <Text style={{ color: "white", fontSize: 13 }}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              style={{ borderRadius: 12, overflow: "hidden" }}
            >
              <LinearGradient
                colors={["#38bdf8", "#0ea5e9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 14,
                  alignItems: "center",
                  borderRadius: 12,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                    Sign In
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials */}
          <View
            style={{
              marginTop: 24,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 13 }}>
              Demo credentials — Username: <Text style={{ fontWeight: "bold" }}>emilys</Text>, Password: <Text style={{ fontWeight: "bold" }}>emilyspass</Text>
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
