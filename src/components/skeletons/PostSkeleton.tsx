import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { BaseCard } from '../base/BaseCard';
import { Spacing } from '../../theme/spacing';

const SkeletonItem = ({ style }: { style: any }) => {
    const animatedValue = new Animated.Value(0);
    const { colors } = useTheme();

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                { backgroundColor: colors.border, opacity },
                style,
            ]}
        />
    );
};

export const PostSkeleton = () => {
    return (
        <BaseCard style={styles.card}>
            <View style={styles.header}>
                <SkeletonItem style={styles.avatar} />
                <View style={styles.headerText}>
                    <SkeletonItem style={styles.name} />
                    <SkeletonItem style={styles.time} />
                </View>
            </View>
            <SkeletonItem style={styles.contentLine1} />
            <SkeletonItem style={styles.contentLine2} />
            <SkeletonItem style={styles.contentLine3} />
        </BaseCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: Spacing.md,
        marginHorizontal: 16,
        marginVertical: 6,
    },
    header: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    name: {
        height: 16,
        width: '40%',
        borderRadius: 4,
        marginBottom: 6,
    },
    time: {
        height: 12,
        width: '20%',
        borderRadius: 4,
    },
    contentLine1: {
        height: 14,
        width: '90%',
        borderRadius: 4,
        marginBottom: 8,
    },
    contentLine2: {
        height: 14,
        width: '80%',
        borderRadius: 4,
        marginBottom: 8,
    },
    contentLine3: {
        height: 14,
        width: '60%',
        borderRadius: 4,
    },
});
