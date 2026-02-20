import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {LinearGradient} from 'expo-linear-gradient';

const SplashScreen = () => {
  const {checkAuthState} = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthState();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#FF6B35', '#FF8E53']}
      style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>CashOrbit</Text>
        <Text style={styles.tagline}>Earn Money Daily</Text>
      </View>
      
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loader: {
    marginTop: 30,
  },
  version: {
    position: 'absolute',
    bottom: 30,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});

export default SplashScreen;