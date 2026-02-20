import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/apiService";

const SettingsScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: null,
    gender: "",
    school: "",
    college: "",
    city: "",
    country: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      console.log('API Base URL:', 'http://192.168.1.32:6000/api');
      
      // Test if we can reach the server first
      const testResponse = await fetch('http://192.168.1.32:6000/');
      console.log('Server test response status:', testResponse.status);
      
      const response = await apiService.get("/users/profile");
      console.log('Profile response:', response);
      const userData = response.user;
      
      setProfile({
        firstName: userData.profile?.firstName || "",
        lastName: userData.profile?.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.profile?.phoneNumber || "",
        dateOfBirth: userData.profile?.dateOfBirth ? new Date(userData.profile.dateOfBirth) : null,
        gender: userData.profile?.gender || "",
        school: userData.profile?.school || "",
        college: userData.profile?.college || "",
        city: userData.profile?.city || "",
        country: userData.profile?.country || "",
        bio: userData.profile?.bio || "",
      });
    } catch (error) {
      console.error('Profile load error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = "Failed to load profile";
      if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        errorMessage = "Cannot connect to server. Please check if backend is running on port 6000.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        school: profile.school,
        college: profile.college,
        city: profile.city,
        country: profile.country,
        bio: profile.bio,
      };

      console.log('Updating profile with data:', updateData);
      const response = await apiService.put("/users/profile", updateData);
      console.log('Update response:', response);
      
      if (response.user) {
        updateUser(response.user);
      }
      
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setProfile({ ...profile, dateOfBirth: selectedDate });
    }
  };

  const formatDate = (date) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString();
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
        <Text style={styles.title}>Settings</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                placeholder="Enter first name"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(text) => setProfile({ ...profile, lastName: text })}
                placeholder="Enter last name"
              />
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile({ ...profile, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={profile.phoneNumber}
            onChangeText={(text) => setProfile({ ...profile, phoneNumber: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateText, !profile.dateOfBirth && styles.placeholder]}>
              {formatDate(profile.dateOfBirth)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={profile.dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.gender}
              onValueChange={(value) => setProfile({ ...profile, gender: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education & Location</Text>
          
          <Text style={styles.label}>School</Text>
          <TextInput
            style={styles.input}
            value={profile.school}
            onChangeText={(text) => setProfile({ ...profile, school: text })}
            placeholder="Enter school name"
          />

          <Text style={styles.label}>College</Text>
          <TextInput
            style={styles.input}
            value={profile.college}
            onChangeText={(text) => setProfile({ ...profile, college: text })}
            placeholder="Enter college name"
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={profile.city}
                onChangeText={(text) => setProfile({ ...profile, city: text })}
                placeholder="Enter city"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={profile.country}
                onChangeText={(text) => setProfile({ ...profile, country: text })}
                placeholder="Enter country"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.bio}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  dateInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  pickerContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 30,
  },
});

export default SettingsScreen;