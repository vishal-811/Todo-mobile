import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        setIsAuthenticated(true);
        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
        });
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Failed to check authentication status',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('accessToken');
              setIsAuthenticated(false);
              Toast.show({
                type: 'success',
                text1: 'Logged out',
                text2: 'You have been successfully logged out',
              });
              router.replace('/signin');
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to logout',
              });
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/signin');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']} 
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#0ea5e9', '#38bdf8']}
            style={styles.avatarGradient}
          >
            <Ionicons name="person" size={60} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.divider} />
      </View>

      {isAuthenticated ? (
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={24} color="#0ea5e9" />
              <Text style={styles.cardHeaderText}>Account Info</Text>
            </View>
            <Text style={[styles.cardHeaderText, { marginBottom: 8 }]}>Welcome back,</Text>
            <Text style={[styles.cardHeaderText, { fontSize: 20, fontWeight: 'bold' }]}>User</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.notAuthCard}>
            <Ionicons name="lock-closed" size={50} color="#94a3b8" />
            <Text style={styles.notAuthText}>Please sign in to continue</Text>
            <Text style={styles.notAuthSubText}>
              Access your todos and profile information
            </Text>
          </View>
          
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <LinearGradient
              colors={['#0ea5e9', '#38bdf8']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="log-in-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatarContainer: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 16,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    fontSize: 16,
    color: '#94a3b8',
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notAuthCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notAuthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 16,
  },
  notAuthSubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: 40,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
