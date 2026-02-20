import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/authService";
import { planService } from "../services/planService";
import { useAuth } from "../context/AuthContext";

const OTPVerificationScreen = ({ navigation, route }) => {
  const { email, name, isSignup } = route.params;
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { login } = useAuth();
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      Alert.alert("Error", "Please enter a valid 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      let userData;
      if (isSignup) {
        userData = await authService.verifySignupOTP(email, otpString, name);
      } else {
        userData = await authService.verifyOTP(email, otpString);
      }

      await login(userData);

      if (isSignup) {
        // Activate free plan for new users
        if (!userData.plan) {
          try {
            await planService.activateFreePlan();
          } catch (error) {
            console.log('Free plan activation failed:', error);
          }
        }
        
        Alert.alert(
          "Success",
          "Account created successfully! Welcome bonus of 50 coins added. Free plan activated."
        );
      }
      
      navigation.navigate("UserTabs");
    } catch (error) {
      Alert.alert("Error", error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setResendLoading(true);
    try {
      if (isSignup) {
        await authService.sendSignupOTP(email, name);
      } else {
        await authService.sendOTP(email);
      }
      setTimer(60);
      Alert.alert("Success", "OTP sent successfully");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to {email}
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={timer > 0 || resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color="#FF6B35" />
            ) : (
              <Text
                style={[
                  styles.resendButton,
                  timer > 0 && styles.disabledResendButton,
                ]}
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: "#FF6B35",
    backgroundColor: "#fff5f2",
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
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
  resendContainer: {
    alignItems: "center",
  },
  resendText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 5,
  },
  resendButton: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledResendButton: {
    color: "#ccc",
  },
});

export default OTPVerificationScreen;
