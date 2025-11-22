import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const EnergyCircle = ({ 
  primaryValue, 
  primaryLabel, 
  secondaryValue, 
  secondaryLabel,
  primaryColor = '#1fb28a',
  secondaryColor = '#E3F2FD',
  size = 180,
  variant = 'report' // 'report' or 'offset'
}) => {
  const center = size / 2;
  const outerRadius = size / 2 - 8;
  const innerRadius = outerRadius - 10;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  
  // Determine which value is Usage and which is Offset
  const isPrimaryUsage = primaryLabel === 'Usage';
  const isSecondaryUsage = secondaryLabel === 'Usage';
  
  const usageValue = isPrimaryUsage ? primaryValue : (isSecondaryUsage ? secondaryValue : primaryValue);
  const offsetValue = isPrimaryUsage ? secondaryValue : (isSecondaryUsage ? primaryValue : secondaryValue);
  
  // Calculate color based on Usage value
  const getUsageColor = (usageValue) => {
    if (usageValue < 100) {
      // Less than 100Wh: Blue
      return '#42A5F5';
    } else {
      // 100Wh and above: Gradient from orange to red
      // Interpolate between orange (#FF9800) and red (#F44336)
      const ratio = Math.min((usageValue - 100) / 100, 1); // Max out at 200Wh for full red
      const r1 = 255, g1 = 152, b1 = 0; // Orange
      const r2 = 244, g2 = 67, b2 = 54; // Red
      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };
  
  // Outer circle (Usage) - always 100% filled, blue color
  const usageColor = getUsageColor(usageValue);
  const outerProgress = 1; // Always 100%
  const outerStrokeDashoffset = 0; // No offset = full circle
  
  // Inner circle (Offset) - shows offset/usage percentage, green color
  const offsetProgress = usageValue > 0 
    ? Math.min(offsetValue / usageValue, 1) // offset/usage, max 100%
    : 0;
  const innerStrokeDashoffset = innerCircumference * (1 - offsetProgress);
  
  // Opacity based on variant
  const outerOpacity = variant === 'offset' ? 0.2 : 1; // Blue circle more transparent in offset page
  const innerOpacity = variant === 'report' ? 0.2 : 1; // Green circle more transparent in report page
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Outer circle background (gray) */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke="#f5f5f5"
          strokeWidth="6"
          fill="none"
        />
        {/* Outer circle (Usage) - always 100%, blue */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          stroke={usageColor}
          strokeWidth="6"
          fill="none"
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          opacity={outerOpacity}
        />
        {/* Inner circle background (gray) */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          stroke="#f5f5f5"
          strokeWidth="5"
          fill="none"
        />
        {/* Inner circle (Offset) - offset/usage percentage, green */}
        {offsetValue !== undefined && (
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke={primaryColor}
            strokeWidth="5"
            fill="none"
            strokeDasharray={innerCircumference}
            strokeDashoffset={innerStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            opacity={innerOpacity}
          />
        )}
      </Svg>
      <View style={styles.content}>
        <Text style={[
          styles.primaryValue,
          isPrimaryUsage && { color: usageColor }
        ]}>
          {primaryValue.toFixed(2)}
        </Text>
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
        {secondaryValue !== undefined && (
          <>
            <View style={styles.divider} />
            <Text style={[
              styles.secondaryValue,
              isSecondaryUsage && { color: usageColor }
            ]}>
              {secondaryValue.toFixed(2)}
            </Text>
            <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E4454',
    marginBottom: 3,
  },
  primaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    width: 24,
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 6,
  },
  secondaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 2,
  },
  secondaryLabel: {
    fontSize: 10,
    color: '#999',
  },
});

export default EnergyCircle;
