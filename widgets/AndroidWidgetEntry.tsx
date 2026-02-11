/**
 * Android Widget Entry Point
 * This file is used by react-native-android-widget to render the widget
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Root widget component - Simple test widget
 */
const WidgetRoot = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.notificationItem}>
          <Text style={styles.notificationTitle}>New Message</Text>
          <Text style={styles.notificationMessage}>Test notification message</Text>
        </View>
      </View>
      <Text style={styles.footer}>Updated just now</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  badge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666666',
  },
  footer: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default WidgetRoot;
