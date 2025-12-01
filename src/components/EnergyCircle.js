import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
// Adjust bar width to be wider as requested
const BAR_WIDTH = width * 0.85;
const BAR_HEIGHT = 48; // Increased height for "thick" bar
const BORDER_RADIUS = 24; // Rounded corners

const EnergyCircle = ({ 
  primaryValue, 
  primaryLabel, 
  secondaryValue, 
  secondaryLabel,
  dailyGoal = 300, // Default daily goal
  onGoalPress, // Callback when goal is pressed
  variant = 'report' // 'report' or 'offset'
}) => {
  // Default is expanded (true)
  const [isExpanded, setIsExpanded] = useState(true);
  const isReport = variant === 'report';
  
  // Calculate Usage Color based on value for Report
  const getUsageColorInfo = (val) => {
    if (val < dailyGoal * 0.33) {
      return { colors: ['#42A5F5', '#2196F3'], label: 'Efficient' };
    } else if (val < dailyGoal * 0.66) {
      return { colors: ['#FF9800', '#F57C00'], label: 'Moderate' };
    } else {
      return { colors: ['#F44336', '#D32F2F'], label: 'High' };
    }
  };

  const usageValue = isReport ? primaryValue : secondaryValue;
  const offsetValue = isReport ? secondaryValue : primaryValue;
  
  const usageInfo = getUsageColorInfo(usageValue);
  const offsetColors = ['#1fb28a', '#00897b'];
  
  // Calculate progress based on daily goal
  let progressRatio = 0;
  let progressColors = [];
  let trackColor = '#F0F2F5';
  let mainText = '';

  if (isReport) {
    progressRatio = Math.min(usageValue / dailyGoal, 1);
    progressColors = usageInfo.colors;
    mainText = `${usageValue.toFixed(2)} Wh`;
  } else {
    progressRatio = usageValue > 0 ? Math.min(offsetValue / usageValue, 1) : 0;
    progressColors = offsetColors;
    mainText = `${offsetValue.toFixed(2)} Wh`;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine text color based on progress ratio to ensure contrast
  // If bar is less than 55% filled, text might be on light background
  const textColor = progressRatio > 0.55 ? '#FFFFFF' : '#333333';
  const textShadowStyle = progressRatio > 0.55 ? {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } : {};

  return (
    <View style={styles.container}>
      
      {/* The Thick Progress Bar Button - Now clickable to toggle details */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={toggleExpand}
        style={styles.barWrapper}
      >
        <Svg width={BAR_WIDTH} height={BAR_HEIGHT} style={styles.svg}>
            <Defs>
                <LinearGradient id="thickBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={progressColors[0]} />
                    <Stop offset="100%" stopColor={progressColors[1]} />
                </LinearGradient>
            </Defs>
            
            {/* Track (Background) */}
            <Rect
                x="0"
                y="0"
                width={BAR_WIDTH}
                height={BAR_HEIGHT}
                rx={BORDER_RADIUS}
                fill={trackColor}
            />

            {/* Progress (Foreground) */}
            <Rect
                x="0"
                y="0"
                width={Math.max(BAR_WIDTH * progressRatio, BORDER_RADIUS * 2)} // Ensure minimal visibility
                height={BAR_HEIGHT}
                rx={BORDER_RADIUS}
                fill="url(#thickBarGradient)"
            />
        </Svg>
        
        {/* Overlay Text */}
        <View style={styles.overlayContainer}>
            <Text style={[styles.overlayText, { color: textColor }, textShadowStyle]}>{mainText}</Text>
        </View>
      </TouchableOpacity>

      {/* Details Section - Visible based on isExpanded state */}
      {isExpanded && (
        <View style={styles.detailsContainer}>
            {/* Daily Goal Setting */}
            {isReport && (
                <View style={styles.goalContainer}>
                    <Text style={styles.goalLabel}>Daily Limit: </Text>
                    <TouchableOpacity onPress={onGoalPress} style={styles.goalButton}>
                        <Text style={styles.goalValue}>
                            {dailyGoal.toFixed(0)} Wh
                        </Text>
                        <View style={styles.underline} />
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.subText}>
                {isReport 
                ? `${(progressRatio * 100).toFixed(0)}% of daily limit used`
                : `${(progressRatio * 100).toFixed(0)}% of usage offset`
                }
            </Text>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Usage</Text>
                    <Text style={styles.statValue}>{usageValue.toFixed(1)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Offset</Text>
                    <Text style={[styles.statValue, { color: '#1fb28a' }]}>
                        {offsetValue.toFixed(1)}
                    </Text>
                </View>
            </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
  barWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  svg: {
    borderRadius: BORDER_RADIUS,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: BAR_WIDTH,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  goalButton: {
    alignItems: 'center',
    marginLeft: 5,
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#6B7280', // Same as label
  },
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: '#6B7280', // Same as label
    marginTop: 1,
  },
  subText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
});

export default EnergyCircle;
