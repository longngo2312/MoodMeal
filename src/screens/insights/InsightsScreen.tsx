import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../contexts/AuthContext';
import { mealService } from '../../services/mealService';
import { symptomService } from '../../services/symptomService';
import { moodService } from '../../services/moodService';
import { insightsService, InsightsData } from '../../services/insightsService';

const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9',
};

const screenWidth = Dimensions.get('window').width - 64;

const chartConfig = {
  backgroundGradientFrom: '#2c2c2c',
  backgroundGradientTo: '#2c2c2c',
  color: (opacity = 1) => `rgba(0, 230, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(238, 238, 238, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  decimalPlaces: 1,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#00e6ff',
  },
};

const PIE_COLORS = ['#4caf50', '#8bc34a', '#ff9800', '#ff5722', '#f44336', '#9c27b0', '#2196f3'];

export const InsightsScreen: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load last 30 days of data
      const endDate = new Date().toISOString().split('T')[0];
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 30);
      const startDate = startDateObj.toISOString().split('T')[0];

      const [meals, symptoms, moods] = await Promise.all([
        mealService.getMealsByDateRange(user.id, startDate, endDate),
        symptomService.getSymptomsByDateRange(user.id, startDate, endDate),
        moodService.getMoodsByDateRange(user.id, startDate, endDate),
      ]);

      const data = insightsService.generateInsights(meals, symptoms, moods);
      setInsights(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [user])
  );

  const renderMoodTrendChart = () => {
    if (!insights || insights.moodTrends.length < 2) return null;

    const last7 = insights.moodTrends.slice(-7);
    const labels = last7.map((t) => t.date.slice(5)); // MM-DD
    const moodData = last7.map((t) => t.avgScore);
    const energyData = last7.map((t) => t.avgEnergy);

    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Mood & Energy Trends (Last 7 Days)</Text>
        <LineChart
          data={{
            labels,
            datasets: [
              { data: moodData, color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, strokeWidth: 2 },
              { data: energyData, color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`, strokeWidth: 2 },
            ],
            legend: ['Mood Score', 'Energy Level'],
          }}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderMoodDistribution = () => {
    if (!insights || insights.moodDistribution.length === 0) return null;

    const data = insights.moodDistribution.map((item, index) => ({
      name: `${item.emoji} ${item.type}`,
      count: item.count,
      color: PIE_COLORS[index % PIE_COLORS.length],
      legendFontColor: '#eeeeee',
      legendFontSize: 12,
    }));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Mood Distribution</Text>
        <PieChart
          data={data}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderMealTimeChart = () => {
    if (!insights || insights.mealTimeCounts.length === 0) return null;

    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Meals by Time of Day</Text>
        <BarChart
          data={{
            labels: insights.mealTimeCounts.map((m) => m.time),
            datasets: [{ data: insights.mealTimeCounts.map((m) => m.count) }],
          }}
          width={screenWidth}
          height={200}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(61, 27, 249, ${opacity})`,
          }}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>
    );
  };

  const renderTopSymptoms = () => {
    if (!insights || insights.topSymptoms.length === 0) return null;

    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Top Symptoms</Text>
        {insights.topSymptoms.map((symptom, index) => (
          <View key={symptom.type} style={styles.symptomRow}>
            <View style={styles.symptomInfo}>
              <Text style={styles.symptomRank}>#{index + 1}</Text>
              <Text style={styles.symptomName}>{symptom.type}</Text>
            </View>
            <View style={styles.symptomStats}>
              <Text style={styles.symptomCount}>{symptom.count}x</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(symptom.avgSeverity) }]}>
                <Text style={styles.severityBadgeText}>Avg: {symptom.avgSeverity}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderCorrelations = () => {
    if (!insights || insights.correlations.length === 0) return null;

    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Food-Symptom Correlations</Text>
        <Text style={styles.chartSubtitle}>
          Ingredients that frequently appear before symptoms
        </Text>
        {insights.correlations.map((corr, index) => (
          <View key={`${corr.ingredient}-${corr.symptomType}`} style={styles.correlationRow}>
            <View style={styles.correlationInfo}>
              <Text style={styles.correlationIngredient}>{corr.ingredient}</Text>
              <Text style={styles.correlationArrow}> → </Text>
              <Text style={styles.correlationSymptom}>{corr.symptomType}</Text>
            </View>
            <View style={styles.correlationStats}>
              <Text style={styles.correlationCount}>{corr.occurrences}x</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(corr.avgSeverity) }]}>
                <Text style={styles.severityBadgeText}>{corr.avgSeverity}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const getSeverityColor = (severity: number): string => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  const hasData = insights && (
    insights.moodTrends.length > 0 ||
    insights.topSymptoms.length > 0 ||
    insights.correlations.length > 0 ||
    insights.moodDistribution.length > 0
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadInsights} />}
    >
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Smart Insights</Text>
        <Text style={styles.screenSubtitle}>Last 30 days analysis</Text>

        {!hasData && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Not enough data yet</Text>
            <Text style={styles.emptyText}>
              Keep logging your meals, symptoms, and moods to see insights and correlations here.
            </Text>
          </View>
        )}

        {renderMoodTrendChart()}
        {renderMoodDistribution()}
        {renderMealTimeChart()}
        {renderTopSymptoms()}
        {renderCorrelations()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  chartSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
    marginTop: 8,
  },
  symptomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  symptomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginRight: 8,
    width: 24,
  },
  symptomName: {
    fontSize: 14,
    color: COLORS.text,
  },
  symptomStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symptomCount: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  severityBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  severityBadgeText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  correlationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  correlationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  correlationIngredient: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  correlationArrow: {
    fontSize: 13,
    color: '#999',
  },
  correlationSymptom: {
    fontSize: 13,
    color: '#ff9800',
    fontWeight: '600',
  },
  correlationStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  correlationCount: {
    fontSize: 13,
    color: '#999',
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
