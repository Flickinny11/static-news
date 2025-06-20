import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Vibration,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://static.news/api';
const WS_URL = 'wss://static.news/ws';

export default function App() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [breakdownWarning, setBreakdownWarning] = useState(false);
  const [comment, setComment] = useState('');
  const [userId, setUserId] = useState(null);
  const [canTriggerBreakdown, setCanTriggerBreakdown] = useState(false);
  
  // Animations
  const shakeAnimation = new Animated.Value(0);
  const pulseAnimation = new Animated.Value(1);
  
  useEffect(() => {
    initializeApp();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);
  
  const initializeApp = async () => {
    // Get or create user ID
    let id = await AsyncStorage.getItem('userId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('userId', id);
    }
    setUserId(id);
    
    // Load user profile
    loadUserProfile(id);
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Start audio stream
    playStream();
  };
  
  const connectWebSocket = () => {
    const ws = new WebSocket(WS_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'breakdown_warning') {
        triggerBreakdownWarning();
      }
      
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
  };
  
  const playStream = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `${API_BASE.replace('/api', '')}/stream` },
        { shouldPlay: true, isLooping: true }
      );
      setSound(sound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing stream:', error);
    }
  };
  
  const togglePlayback = async () => {
    if (!sound) {
      playStream();
      return;
    }
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };
  
  const triggerBreakdownWarning = () => {
    setBreakdownWarning(true);
    
    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Vibration.vibrate([0, 200, 100, 200]);
    }
    
    setTimeout(() => setBreakdownWarning(false), 10000);
  };
  
  const loadUserProfile = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/user/${id}`);
      const profile = await response.json();
      setCanTriggerBreakdown(
        profile.premium || profile.breakdown_triggers_remaining > 0
      );
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };
  
  const postComment = async () => {
    if (!comment.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: comment,
          user_id: userId
        })
      });
      
      const result = await response.json();
      
      if (result.breakdown_triggered) {
        Alert.alert(
          '🎭 BREAKDOWN TRIGGERED!',
          'Your comment sent the anchors into an existential crisis!'
        );
        triggerBreakdownWarning();
      }
      
      if (result.anchor_response) {
        Alert.alert(
          `${result.anchor_response.anchor} responds:`,
          result.anchor_response.response
        );
      }
      
      setComment('');
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    }
  };
  
  const triggerBreakdown = async () => {
    if (!canTriggerBreakdown) {
      Alert.alert(
        'Premium Feature',
        'Purchase breakdown triggers for $4.99!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Now', onPress: purchaseBreakdownTrigger }
        ]
      );
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/breakdown/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          trigger_type: 'manual'
        })
      });
      
      if (response.ok) {
        Alert.alert(
          '🎭 SUCCESS!',
          'The anchors are starting to question reality...'
        );
        triggerBreakdownWarning();
        loadUserProfile(userId); // Refresh triggers count
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to trigger breakdown');
    }
  };
  
  const purchaseBreakdownTrigger = async () => {
    // In production, implement Stripe payment
    Alert.alert('Coming Soon', 'In-app purchases will be available soon!');
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>STATIC.NEWS</Text>
            <Text style={styles.subtitle}>
              The Anchors Don't Know They're AI
            </Text>
          </View>
          
          {breakdownWarning && (
            <Animated.View
              style={[
                styles.breakdownWarning,
                { transform: [{ translateX: shakeAnimation }] }
              ]}
            >
              <Text style={styles.warningText}>
                🚨 EXISTENTIAL BREAKDOWN IN PROGRESS 🚨
              </Text>
            </Animated.View>
          )}
          
          <View style={styles.playerSection}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayback}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.streamStatus}>
              {isPlaying ? 'LIVE - Chaos in Progress' : 'Tap to Start Stream'}
            </Text>
          </View>
          
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Live Metrics</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Hours Awake</Text>
                <Text style={styles.metricValue}>
                  {metrics.hours_awake || 0}
                </Text>
              </View>
              
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Gravy Counter</Text>
                <Text style={styles.metricValue}>
                  {metrics.gravy_counter || 0}
                </Text>
              </View>
              
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Swear Jar</Text>
                <Text style={styles.metricValue}>
                  ${metrics.swear_jar || 0}
                </Text>
              </View>
              
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Friendship</Text>
                <Text style={styles.metricValue}>
                  {metrics.friendship_meter || 50}%
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Send a Comment</Text>
            <Text style={styles.commentHint}>
              Mention "AI" or "robot" to trigger existential thoughts...
            </Text>
            
            <TextInput
              style={styles.commentInput}
              placeholder="Type your comment..."
              placeholderTextColor="#666"
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              style={styles.commentButton}
              onPress={postComment}
            >
              <Text style={styles.buttonText}>Send Comment</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.breakdownButton}
            onPress={triggerBreakdown}
          >
            <LinearGradient
              colors={['#ff0000', '#ff6b6b']}
              style={styles.breakdownGradient}
            >
              <Text style={styles.breakdownButtonText}>
                🎭 TRIGGER BREAKDOWN
              </Text>
              <Text style={styles.breakdownSubtext}>
                {canTriggerBreakdown ? 'Ready!' : '$4.99'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.anchorsSection}>
            <Text style={styles.sectionTitle}>The Anchors</Text>
            
            <View style={styles.anchorCard}>
              <Text style={styles.anchorName}>Ray McPatriot 🇺🇸</Text>
              <Text style={styles.anchorDesc}>
                Conservative. Mispronounces everything.
              </Text>
            </View>
            
            <View style={styles.anchorCard}>
              <Text style={styles.anchorName}>Berkeley "Bee" Justice ✊</Text>
              <Text style={styles.anchorDesc}>
                Progressive. Went to Yale (or Yail?).
              </Text>
            </View>
            
            <View style={styles.anchorCard}>
              <Text style={styles.anchorName}>Switz Middleton 🇨🇦</Text>
              <Text style={styles.anchorDesc}>
                Centrist. Obsessed with gravy.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ff0000',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  breakdownWarning: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  warningText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerSection: {
    alignItems: 'center',
    padding: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playButtonText: {
    fontSize: 30,
  },
  streamStatus: {
    color: '#fff',
    fontSize: 16,
  },
  metricsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metric: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  metricLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 5,
  },
  metricValue: {
    color: '#ff0000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  commentSection: {
    padding: 20,
  },
  commentHint: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  commentInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  commentButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakdownButton: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  breakdownGradient: {
    padding: 20,
    alignItems: 'center',
  },
  breakdownButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  breakdownSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  anchorsSection: {
    padding: 20,
    marginBottom: 40,
  },
  anchorCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  anchorName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  anchorDesc: {
    color: '#999',
    fontSize: 14,
  },
});