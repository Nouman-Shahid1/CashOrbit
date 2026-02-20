import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { withdrawService } from "../services/withdrawService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";

const WithdrawScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [nextWithdrawDay, setNextWithdrawDay] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    checkWithdrawDay();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, history] = await Promise.all([
        userService.getUserStats(),
        withdrawService.getWithdrawHistory(),
      ]);
      
      // Get withdrawal limits from user's plan
      const dailyLimit = user?.plan?.dailyWithdrawLimit || 5000;
      
      setUserStats({
        ...stats,
        availablePKR: stats.pkrValue || 0,
        minWithdraw: 100,
        maxWithdraw: dailyLimit,
      });
      setWithdrawHistory(history);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkWithdrawDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const isFriday = dayOfWeek === 5;
    const isSunday = dayOfWeek === 0;

    setCanWithdraw(isFriday || isSunday);

    if (!isFriday && !isSunday) {
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      const daysUntilSunday = (7 - dayOfWeek) % 7;

      if (daysUntilFriday <= daysUntilSunday) {
        setNextWithdrawDay(`Friday (${daysUntilFriday} days)`);
      } else {
        setNextWithdrawDay(`Sunday (${daysUntilSunday} days)`);
      }
    }
  };

  const requestWithdraw = async () => {
    if (!canWithdraw) {
      Alert.alert("Error", "Withdrawals are only allowed on Friday and Sunday");
      return;
    }

    if (!withdrawAmount || !paymentMethod) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < userStats.minWithdraw || amount > userStats.maxWithdraw) {
      Alert.alert(
        "Error",
        `Amount must be between PKR ${userStats.minWithdraw} - ${userStats.maxWithdraw}`
      );
      return;
    }

    if (amount > userStats.availablePKR) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    try {
      await withdrawService.requestWithdraw({
        amount,
        paymentMethod,
      });

      Alert.alert("Success", "Withdraw request submitted successfully!");
      setWithdrawAmount("");
      setPaymentMethod("");
      loadData();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to submit withdraw request"
      );
    }
  };

  const getDayName = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  const WithdrawHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <Ionicons
          name={
            item.status === "Paid"
              ? "checkmark-circle"
              : item.status === "Rejected"
              ? "close-circle"
              : "time"
          }
          size={24}
          color={
            item.status === "Paid"
              ? "#FF6B35"
              : item.status === "Rejected"
              ? "#f44336"
              : "#FF9800"
          }
        />
      </View>

      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyAmount}>PKR {item.amount}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "Paid"
                    ? "#FF6B35"
                    : item.status === "Rejected"
                    ? "#f44336"
                    : "#FF9800",
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.historyDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.historyCoins}>Coins: {item.coinsDeducted}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Withdraw Funds</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <View style={styles.statusSection}>
          <LinearGradient
            colors={
              canWithdraw ? ["#E8F5E8", "#F1F8E9"] : ["#FFEBEE", "#FCE4EC"]
            }
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <Ionicons
                name={canWithdraw ? "checkmark-circle" : "time"}
                size={24}
                color={canWithdraw ? "#FF6B35" : "#f44336"}
              />
              <Text style={styles.statusTitle}>Withdraw Status</Text>
            </View>

            <Text style={styles.currentDay}>Today: {getDayName()}</Text>
            <Text
              style={[
                styles.withdrawStatus,
                { color: canWithdraw ? "#FF6B35" : "#f44336" },
              ]}
            >
              {canWithdraw
                ? "✅ Withdraw Available"
                : "❌ Withdraw Not Available"}
            </Text>

            {!canWithdraw && (
              <Text style={styles.nextWithdraw}>
                Next available: {nextWithdrawDay}
              </Text>
            )}

            <Text style={styles.scheduleNote}>
              💡 Withdrawals are only allowed on Friday and Sunday
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Ionicons name="wallet" size={24} color="#FF6B35" />
              <Text style={styles.balanceTitle}>Available Balance</Text>
            </View>

            <View style={styles.balanceContent}>
              <Text style={styles.balanceAmount}>
                PKR {userStats.availablePKR || 0}
              </Text>
              <Text style={styles.balanceCoins}>
                ({userStats.coins || 0} coins)
              </Text>
            </View>

            <View style={styles.limitsContainer}>
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Min</Text>
                <Text style={styles.limitValue}>
                  PKR {userStats.minWithdraw || 100}
                </Text>
              </View>
              <View style={styles.limitDivider} />
              <View style={styles.limitItem}>
                <Text style={styles.limitLabel}>Max</Text>
                <Text style={styles.limitValue}>
                  PKR {userStats.maxWithdraw || 5000}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>💰 Withdraw Request</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount (PKR)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="cash"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={`Enter amount (${
                    userStats.minWithdraw || 100
                  } - ${userStats.maxWithdraw || 5000})`}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="numeric"
                  editable={canWithdraw}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="card"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., JazzCash: 03001234567"
                  value={paymentMethod}
                  onChangeText={setPaymentMethod}
                  editable={canWithdraw}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.withdrawButton,
                !canWithdraw && styles.disabledButton,
              ]}
              onPress={requestWithdraw}
              disabled={!canWithdraw}
            >
              <Ionicons
                name={canWithdraw ? "send" : "lock-closed"}
                size={16}
                color="#fff"
              />
              <Text style={styles.withdrawButtonText}>
                {canWithdraw ? "Submit Request" : "Withdraw Locked"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>📋 Recent Withdrawals</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading history...</Text>
            </View>
          ) : withdrawHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.noHistoryText}>No withdrawals yet</Text>
              <Text style={styles.noHistorySubtext}>
                Your withdrawal history will appear here
              </Text>
            </View>
          ) : (
            withdrawHistory
              .slice(0, 3)
              .map((item, index) => (
                <WithdrawHistoryItem key={index} item={item} />
              ))
          )}
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
  placeholder: {
    width: 40,
  },
  statusSection: {
    padding: 20,
    marginTop: -10,
  },
  statusCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  currentDay: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  withdrawStatus: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  nextWithdraw: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  scheduleNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  balanceContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 5,
  },
  balanceCoins: {
    fontSize: 14,
    color: "#666",
  },
  limitsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 15,
  },
  limitItem: {
    flex: 1,
    alignItems: "center",
  },
  limitDivider: {
    width: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 15,
  },
  limitLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
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
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: "#333",
  },
  withdrawButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 15,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  withdrawButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyHistory: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 40,
    alignItems: "center",
  },
  noHistoryText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 15,
    marginBottom: 5,
  },
  noHistorySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  historyItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIcon: {
    marginRight: 15,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  historyDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  historyCoins: {
    fontSize: 14,
    color: "#666",
  },
});

export default WithdrawScreen;
