import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/AuthContext';
import { moodService, MoodFormData } from '../../services/moodService';
import { RootStackParamList } from '../../types';

// TODO: [Phase 1.2] Replace local COLORS with useTheme() — same pattern as DashboardScreen.
//
// TODO: [Phase 4.2] Add micro-interactions to mood selection:
//   1. Emoji cards — on select, run a Reanimated spring scale: 1 → 1.3 → 1
//      and a glow ring (use Skia Canvas) that fades in around the selected emoji.
//   2. Energy slider — replace the default @react-native-community/slider with a
//      custom Skia-drawn slider track. The filled portion glows in the selected mood's color.
//      The thumb is a glowing circle that pulses at 1Hz.
//   3. Deselect animation — previously selected emoji shrinks back: 1 → 0.9 → 1 (spring)
//
// RESOURCES:
//   Reanimated spring — https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring
//   react-native-skia Canvas — https://shopify.github.io/react-native-skia/docs/canvas/overview
//   Custom slider with Skia — https://shopify.github.io/react-native-skia/docs/shapes/path
const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9ff',
};

const MOOD_OPTIONS: {
  type: 'great' | 'good' | 'okay' | 'bad' | 'awful';
  emoji: string;
  label: string;
  score: number;
  color: string;
}[] = [
  { type: 'great', emoji: '😄', label: 'Great', score: 5, color: '#4caf50' },
  { type: 'good', emoji: '🙂', label: 'Good', score: 4, color: '#8bc34a' },
  { type: 'okay', emoji: '😐', label: 'Okay', score: 3, color: '#ff9800' },
  { type: 'bad', emoji: '😞', label: 'Bad', score: 2, color: '#ff5722' },
  { type: 'awful', emoji: '😢', label: 'Awful', score: 1, color: '#f44336' },
];

type MoodFormRouteProp = RouteProp<RootStackParamList, 'MoodForm'>;
type MoodFormNavigationProp = StackNavigationProp<RootStackParamList>;

export const MoodFormScreen: React.FC = () => {
  const navigation = useNavigation<MoodFormNavigationProp>();
  const route = useRoute<MoodFormRouteProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[number] | null>(null);
  const [notes, setNotes] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0]);

  useEffect(() => {
    if (route.params?.mood) {
      const mood = route.params.mood;
      const found = MOOD_OPTIONS.find(m => m.type === mood.mood_type);
      if (found) setSelectedMood(found);
      setNotes(mood.notes || '');
      setEnergyLevel(mood.energy_level ?? 5);
      setDate(mood.date);
      setTime(mood.time);
    }
  }, [route.params]);

  const saveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }

    setLoading(true);
    try {
      const formData: MoodFormData = {
        mood_type: selectedMood.type,
        mood_score: selectedMood.score,
        emoji: selectedMood.emoji,
        notes,
        energy_level: energyLevel,
        date,
        time,
      };

      if (route.params?.mood && route.params.mood.id) {
        await moodService.updateMood(route.params.mood.id, user!.id, formData);
        Alert.alert('Success', 'Mood updated successfully!');
      } else {
        await moodService.createMood(user!.id, formData);
        Alert.alert('Success', 'Mood logged successfully!');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEnergyLabel = (level: number): string => {
    if (level <= 2) return 'Very Low';
    if (level <= 4) return 'Low';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'High';
    return 'Very High';
  };

  const getEnergyColor = (level: number): string => {
    if (level <= 2) return '#f44336';
    if (level <= 4) return '#ff9800';
    if (level <= 6) return '#ffeb3b';
    if (level <= 8) return '#8bc34a';
    return '#4caf50';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>How are you feeling? *</Text>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.type}
                  style={[
                    styles.moodOption,
                    selectedMood?.type === mood.type && {
                      borderColor: mood.color,
                      backgroundColor: mood.color + '20',
                    },
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      selectedMood?.type === mood.type && { color: mood.color },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Energy Level</Text>
            <View style={styles.energyContainer}>
              <View style={styles.energyHeader}>
                <Text style={[styles.energyValue, { color: getEnergyColor(energyLevel) }]}>
                  {energyLevel}/10
                </Text>
                <Text style={[styles.energyLabel, { color: getEnergyColor(energyLevel) }]}>
                  {getEnergyLabel(energyLevel)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={energyLevel}
                onValueChange={setEnergyLevel}
                minimumTrackTintColor={getEnergyColor(energyLevel)}
                maximumTrackTintColor="#ddd"
                thumbTintColor={getEnergyColor(energyLevel)}
              />
              <View style={styles.energyScale}>
                <Text style={styles.scaleText}>1 (Low)</Text>
                <Text style={styles.scaleText}>10 (High)</Text>
              </View>
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="What's on your mind? Any triggers or thoughts..."
              placeholderTextColor="#606060ff"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#606060ff"
            />

            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM:SS"
              placeholderTextColor="#606060ff"
            />

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={saveMood}
              disabled={loading}
            >
              <LinearGradient
                style={styles.linearGradient}
                colors={['#3d1bf9ff', '#826ef5ff']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : route.params?.mood?.id ? 'Update Mood' : 'Save Mood'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
    width: '18%',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '600',
  },
  energyContainer: {
    marginBottom: 16,
  },
  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  energyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  energyScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleText: {
    fontSize: 12,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.text,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linearGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
