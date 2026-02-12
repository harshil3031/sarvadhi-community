// import React, { useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';

// const { width, height } = Dimensions.get('window');

// interface SplashScreenProps {
//   onAnimationEnd?: () => void;
// }

// export default function SplashScreen({ onAnimationEnd }: SplashScreenProps) {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.3)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Logo animation sequence
//     Animated.sequence([
//       // Fade in and scale up
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           friction: 4,
//           tension: 40,
//           useNativeDriver: true,
//         }),
//       ]),
//       // Rotate slightly
//       Animated.timing(rotateAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       // Wait longer so users can see the splash
//       Animated.delay(1200),
//     ]).start(() => {
//       if (onAnimationEnd) {
//         onAnimationEnd();
//       }
//     });
//   }, []);

//   const rotation = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#667eea', '#764ba2', '#f093fb']}
//         style={styles.gradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <Animated.View
//           style={[
//             styles.logoContainer,
//             {
//               opacity: fadeAnim,
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//         >
//           <Animated.View style={{ transform: [{ rotate: rotation }] }}>
//             <View style={styles.logoCircle}>
//               <Image
//                 source={require('../assets/images/logo.jpg')}
//                 style={styles.logoImage}
//                 resizeMode="cover"
//               />
//             </View>
//           </Animated.View>
          
//           <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
//             SARVADHI
//           </Animated.Text>
//           <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
//             Community
//           </Animated.Text>
//           <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
//             Connect • Share • Grow Together
//           </Animated.Text>
//         </Animated.View>

//         {/* Loading indicator */}
//         <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
//           <View style={styles.loadingDots}>
//             <LoadingDot delay={0} />
//             <LoadingDot delay={200} />
//             <LoadingDot delay={400} />
//           </View>
//         </Animated.View>
//       </LinearGradient>
//     </View>
//   );
// }

// const LoadingDot = ({ delay }: { delay: number }) => {
//   const bounceAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const animation = Animated.loop(
//       Animated.sequence([
//         Animated.delay(delay),
//         Animated.timing(bounceAnim, {
//           toValue: 1,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//         Animated.timing(bounceAnim, {
//           toValue: 0,
//           duration: 400,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     animation.start();

//     return () => animation.stop();
//   }, []);

//   const translateY = bounceAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, -10],
//   });

//   return (
//     <Animated.View
//       style={[
//         styles.dot,
//         {
//           transform: [{ translateY }],
//         },
//       ]}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   gradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoCircle: {
//     width: 160,
//     height: 160,
//     borderRadius: 80,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 4,
//     borderColor: 'rgba(255, 255, 255, 0.4)',
//     marginBottom: 30,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 10,
//     overflow: 'hidden',
//   },
//   logoImage: {
//     width: 160,
//     height: 160,
//     borderRadius: 80,
//   },
//   appName: {
//     fontSize: 52,
//     fontWeight: '900',
//     color: '#fff',
//     marginTop: 20,
//     letterSpacing: 4,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 10,
//   },
//   tagline: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#fff',
//     marginTop: 8,
//     letterSpacing: 2,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#fff',
//     opacity: 0.8,
//     marginTop: 12,
//     letterSpacing: 1,
//   },
//   loadingContainer: {
//     position: 'absolute',
//     bottom: 100,
//   },
//   loadingDots: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#fff',
//     marginHorizontal: 6,
//   },
// });


import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationEnd?: () => void;
}

export default function SplashScreen({ onAnimationEnd }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      onAnimationEnd?.();
    }, 1200);
  }, []);

  const floatingY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ff6a00', '#ee0979', '#8e2de2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Icons Background */}
        <Animated.View
          style={[
            styles.floatingIcon,
            { transform: [{ translateY: floatingY }] },
          ]}
        >
          <Ionicons name="chatbubble-ellipses" size={40} color="rgba(255,255,255,0.2)" />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingIcon2,
            { transform: [{ translateY: floatingY }] },
          ]}
        >
          <Ionicons name="people" size={50} color="rgba(255,255,255,0.15)" />
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/logo.jpg')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.appName}>Sarvadhi</Text>
          <Text style={styles.tagline}>Where Communities Connect</Text>

          <LoadingDots />
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  const translate = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -8],
    });

  return (
    <View style={styles.loadingContainer}>
      {[dot1, dot2, dot3].map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [{ translateY: translate(anim) }],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
  },

  logoWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },

  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    marginBottom: 30,
  },

  loadingContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 6,
  },

  floatingIcon: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.15,
  },

  floatingIcon2: {
    position: 'absolute',
    bottom: height * 0.25,
    right: width * 0.2,
  },
});
