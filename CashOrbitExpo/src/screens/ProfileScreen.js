import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Share,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState({});
  const [referralStats, setReferralStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [stats, referrals] = await Promise.all([
        userService.getUserStats(),
        userService.getReferralStats(),
      ]);
      setUserStats(stats);
      setReferralStats(referrals);
    } catch (error) {
      console.error("Error loading profile data:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const copyReferralCode = async () => {
    try {
      await Share.share({
        message: `Join CashOrbit and start earning! Use my referral code: ${
          referralStats.referralCode || "CASH123"
        }`,
      });
    } catch (error) {
      Alert.alert("Copied!", "Referral code copied to clipboard");
    }
  };

  const ProfileItem = ({ icon, title, value, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileIconContainer}>
        <Ionicons name={icon} size={20} color="#FF6B35" />
      </View>
      <View style={styles.profileContent}>
        <Text style={styles.profileTitle}>{title}</Text>
        {value && <Text style={styles.profileValue}>{value}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* User Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.userCard}>
            <LinearGradient
              colors={["#FF6B35", "#FF8E53"]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.phone?.charAt(0) || "👤"}
              </Text>
            </LinearGradient>

            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>

            <View style={styles.planBadge}>
              <Ionicons name="diamond" size={16} color="#FF6B35" />
              <Text style={styles.userPlan}>
                {userStats.plan || "Free"} Plan
              </Text>
            </View>

            {userStats.planExpiry && (
              <Text style={styles.planExpiry}>
                Expires: {new Date(userStats.planExpiry).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="wallet" size={24} color="#FF6B35" />
              <Text style={styles.statValue}>{userStats.coins || 0}</Text>
              <Text style={styles.statLabel}>Total Coins</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="cash" size={24} color="#FF9800" />
              <Text style={styles.statValue}>
                PKR {userStats.pkrValue || 0}
              </Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>
          </View>
        </View>

        {/* Referral Section */}
        <View style={styles.referralSection}>
          <View style={styles.referralCard}>
            <View style={styles.referralHeader}>
              <Ionicons name="people" size={24} color="#FF6B35" />
              <Text style={styles.referralTitle}>Referral Program</Text>
            </View>

            <View style={styles.referralStats}>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatValue}>
                  {referralStats.totalReferrals || 0}
                </Text>
                <Text style={styles.referralStatLabel}>Friends Referred</Text>
              </View>

              <View style={styles.referralDivider} />

              <View style={styles.referralStat}>
                <Text style={styles.referralStatValue}>
                  {referralStats.referralCoins || 0}
                </Text>
                <Text style={styles.referralStatLabel}>Bonus Coins</Text>
              </View>
            </View>

            <View style={styles.referralCodeContainer}>
              <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
              <TouchableOpacity
                style={styles.referralCodeButton}
                onPress={copyReferralCode}
              >
                <Text style={styles.referralCode}>
                  {referralStats.referralCode || "CASH123"}
                </Text>
                <Ionicons name="share" size={16} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          <View style={styles.profileOptions}>
            <ProfileItem
              icon="people"
              title="Referral Program"
              value="Invite friends & earn"
              onPress={() => navigation.navigate("Referral")}
            />

            <ProfileItem
              icon="trending-up"
              title="Upgrade Plan"
              value="Get premium benefits"
              onPress={() => navigation.navigate("UpgradePlan")}
            />

            <ProfileItem
              icon="bar-chart"
              title="Earnings Report"
              value="View detailed stats"
              onPress={() => navigation.navigate("EarningReport")}
            />

            <ProfileItem
              icon="list"
              title="Task History"
              value="Completed tasks"
              onPress={() => navigation.navigate("TaskHistory")}
            />

            <ProfileItem
              icon="card"
              title="Withdraw History"
              value="Payment records"
              onPress={() => navigation.navigate("WithdrawalHistory")}
            />

            {/* <ProfileItem
              icon="help-circle"
              title="Help & Support"
              value="Get assistance"
              onPress={() => {}}
            /> */}

            <ProfileItem
              icon="settings"
              title="Settings"
              value="Edit profile & preferences"
              onPress={() => navigation.navigate("Settings")}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CashOrbit v1.0.0</Text>
          {/* <Text style={styles.footerSubtext}>Made with ❤️ for earning</Text> */}
        </View>
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    padding: 20,
    marginTop: -10,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  userPlan: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
    marginLeft: 5,
  },
  planExpiry: {
    fontSize: 12,
    color: "#666",
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  referralSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  referralCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  referralStats: {
    flexDirection: "row",
    marginBottom: 20,
  },
  referralStat: {
    flex: 1,
    alignItems: "center",
  },
  referralDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
  },
  referralStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 5,
  },
  referralStatLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  referralCodeContainer: {
    alignItems: "center",
  },
  referralCodeLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  referralCodeButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  referralCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileOptions: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE0D6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 14,
    color: "#666",
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    borderRadius: 15,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 10,
    color: "#ccc",
  },
});

export default ProfileScreen;
