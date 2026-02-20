import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { adminService } from "../../services/adminService";

const { width } = Dimensions.get("window");

const AdminPlanApprovals = ({ navigation }) => {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingDeposits();
  }, []);

  const loadPendingDeposits = async () => {
    try {
      const response = await adminService.getPendingDeposits();
      setPendingDeposits(response.deposits || []);
    } catch (error) {
      console.error("Error loading pending deposits:", error);
    }
  };

  const handleApprove = (deposit) => {
    Alert.alert(
      "Approve Plan",
      `Approve ${deposit.planName} for ${deposit.userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setLoading(true);
            try {
              await adminService.approveDeposit(deposit._id);
              Alert.alert("Success", "Plan approved successfully!");
              loadPendingDeposits();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to approve plan");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = (deposit) => {
    Alert.alert(
      "Reject Plan",
      `Reject ${deposit.planName} for ${deposit.userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await adminService.rejectDeposit(deposit._id);
              Alert.alert("Success", "Plan rejected successfully!");
              loadPendingDeposits();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to reject plan");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingDeposits();
    setRefreshing(false);
  };

  const DepositCard = ({ deposit, index }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.depositCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#fff", "#f8f9ff"]}
          style={styles.cardGradient}
        >
          <View style={styles.depositHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {deposit.userName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{deposit.userName}</Text>
                <Text style={styles.userEmail}>{deposit.userEmail}</Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>PENDING</Text>
              </View>
            </View>
          </View>

          <View style={styles.planSection}>
            <LinearGradient
              colors={["#FF6B35", "#FF8E53"]}
              style={styles.planBadge}
            >
              <Ionicons name="diamond" size={18} color="#fff" />
              <Text style={styles.planName}>{deposit.planName}</Text>
            </LinearGradient>
            <Text style={styles.planAmount}>
              PKR {deposit.amount?.toLocaleString()}
            </Text>
          </View>

          <View style={styles.depositDetails}>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="card" size={16} color="#FF6B35" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text style={styles.detailValue}>
                    {deposit.transactionId}
                  </Text>
                </View>
              </View>

              {/* <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="person" size={16} color="#FF6B35" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Depositor</Text>
                  <Text style={styles.detailValue}>{deposit.depositorName}</Text>
                </View>
              </View> */}

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time" size={16} color="#FF6B35" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Submitted</Text>
                  <Text style={styles.detailValue}>
                    {new Date(deposit.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(deposit)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#4CAF50", "#45a049"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(deposit)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#f44336", "#d32f2f"]}
                style={styles.buttonGradient}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      <LinearGradient colors={["#FF6B35", "#FF8E53"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan Approvals</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <LinearGradient colors={["#fff", "#f8f9ff"]} style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="hourglass" size={24} color="#FF6B35" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{pendingDeposits.length}</Text>
                <Text style={styles.statLabel}>Pending Approvals</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {pendingDeposits.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={["#f8f9fa", "#e9ecef"]}
              style={styles.emptyContainer}
            >
              <View style={styles.emptyIconContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#28a745" />
              </View>
              <Text style={styles.emptyText}>All Caught Up!</Text>
              <Text style={styles.emptySubtext}>
                No pending plan approvals at the moment
              </Text>
            </LinearGradient>
          </View>
        ) : (
          pendingDeposits.map((deposit, index) => (
            <DepositCard
              key={deposit._id || index}
              deposit={deposit}
              index={index}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    marginBottom: 25,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FF6B35",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  depositCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardGradient: {
    padding: 20,
  },
  depositHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f39c12",
    marginRight: 6,
  },
  statusText: {
    color: "#d68910",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  planSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  planName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  planAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2c3e50",
  },
  depositDetails: {
    marginBottom: 20,
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    borderRadius: 25,
    width: width - 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
});

export default AdminPlanApprovals;
