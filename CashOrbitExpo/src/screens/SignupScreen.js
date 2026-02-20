import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { apiService } from "../services/apiService";

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const { login } = useAuth();

  const handleSignup = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    
    // Test connection first
    const isConnected = await apiService.testConnection();
    if (!isConnected) {
      Alert.alert(
        "Connection Error", 
        "Cannot connect to server. Please check:\n\n" +
        "1. Backend server is running\n" +
        "2. Server is on port 5000\n" +
        "3. Your network connection\n\n" +
        "Current server: http://192.168.1.32:6000"
      );
      setLoading(false);
      return;
    }
    
    try {
      const response = await authService.signup(
        formData.name,
        formData.email,
        formData.password,
        formData.referralCode
      );
      
      if (response.requiresEmailVerification) {
        Alert.alert(
          "Verification Required",
          "Please verify your email address to complete registration.",
          [
            {
              text: "Verify Now",
              onPress: () => navigation.navigate('OTPVerification', {
                email: formData.email,
                name: formData.name,
                isSignup: true
              })
            }
          ]
        );
      }
    } catch (error) {
      const errorMessage = error.message || "Signup failed";
      
      if (errorMessage.includes('already exists')) {
        Alert.alert("Error", "Account already exists with this email. Please login instead.");
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'confirmPassword' || (field === 'password' && formData.confirmPassword)) {
      const password = field === 'password' ? value : formData.password;
      const confirmPassword = field === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (confirmPassword.length > 0) {
        setPasswordMatch(password === confirmPassword);
      } else {
        setPasswordMatch(null);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.replace("Welcome")}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join CashOrbit and start earning today!
        </Text>
      </LinearGradient>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person"
              size={20}
              color="#FF6B35"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail"
              size={20}
              color="#FF6B35"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed"
              size={20}
              color="#FF6B35"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#FF6B35"
              />
            </TouchableOpacity>
          </View>
          {formData.password.length > 0 && formData.password.length < 6 && (
            <Text style={styles.errorText}>Password must be at least 6 characters</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed"
              size={20}
              color="#FF6B35"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color="#FF6B35"
              />
            </TouchableOpacity>
          </View>
          {formData.confirmPassword.length > 0 && passwordMatch === false && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Referral Code (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="people"
              size={20}
              color="#FF6B35"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter referral code"
              value={formData.referralCode}
              onChangeText={(value) => handleInputChange("referralCode", value.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{" "}
            <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: "relative",
    zIndex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    zIndex: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 0,
    fontSize: 16,
    textAlignVertical: "center",
  },
  eyeIcon: {
    padding: 5,
  },
  statusIcon: {
    marginRight: 5,
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  loginLinkText: {
    color: "#666",
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#FF6B35",
    fontWeight: "600",
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 5,
  },
});

export default SignupScreen;
