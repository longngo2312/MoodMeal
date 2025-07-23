import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

// Main Authentication Screen Component
export const AuthScreen = () => {
  // State management for form inputs and loading state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  // Handle authentication logic for both sign in and sign up
  const handleAuth = async () => {
    // Validate form inputs
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Attempt authentication based on mode (login/signup)
      if (isLogin) {
        await signIn(email, password);
      } 
      else {
        await signUp(email, password);
        Alert.alert('Success', 'Account created! Please check your email to verify your account.');
      }
    } 
    catch (error) {
      Alert.alert('Error', error.message);
    } 
    finally {
      setLoading(false);
    }
  };

  // UI Render
  return (
    // KeyboardAvoidingView handles keyboard behavior on different platforms
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#3123f481','#9381f9','#5b43e380']}
        start={{x:-100,y:-355}}
        end={{x:100,y:355}}
        style={styles.gradientBackground}
      >
        {/* ScrollView allows content to scroll when keyboard is shown */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <MaterialCommunityIcons name="food-apple-outline" size={64} color="#2e7d32" style={styles.appIcon} />
            <Text style={styles.title}>Moodmeal</Text>
            <Text style={styles.subtitle}>Track your meals and symptoms</Text>

            <View style={styles.form}>
              {/*Email Input*/}
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#9ca3af" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#9ca3af" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  keyboardType="email-address"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              

              <TouchableOpacity
                style={[
                  styles.button, 
                  loading && styles.buttonDisabled,
                  isLogin ? styles.button : styles.button,
                ]}
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                  <Text style={styles.switchLinkText}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#507A86',
    justifyContent: 'center',
    //alignItems: 'center',
    padding: 20,
  },
  gradientBackground: {
    flex: 1, // Make the gradient fill its parent
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset : {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },
  appIcon: {
    marginBottom: 5,
  },
  // Typography styles
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Form styles
  form: {
    width: '100%',
    maxWidth: 500,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 9,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex:1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  
  // Button styles
  button: {
    backgroundColor: '#6a53eeff',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset : {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 10,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af', // gray-400 for disabled
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18, // text-lg equivalent
    fontWeight: '600'
  },
  
  // Switch button styles
  switchButton: {
    alignItems: 'center',
    padding: 8,
    fontSize: 14
  },
  switchText: {
    color: '#000000ff',
    fontSize: 14,
  },
  switchLinkText: {
    color: '#4f46e5',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
