// import React, { useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   FlatList,
//   Animated,
//   StatusBar,
//   Image,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LinearGradient } from 'expo-linear-gradient';
// import { STORAGE_KEYS } from '@/config/constants';

// const { width, height } = Dimensions.get('window');

// interface OnboardingSlide {
//   id: string;
//   icon: keyof typeof Ionicons.glyphMap;
//   title: string;
//   description: string;
//   gradient: [string, string];
// }

// const slides: OnboardingSlide[] = [
//   {
//     id: '1',
//     icon: 'people-circle',
//     title: 'Welcome to Sarvadhi Community',
//     description: 'Connect with your community, share ideas, and build meaningful relationships in one place.',
//     gradient: ['#667eea', '#764ba2'],
//   },
//   {
//     id: '2',
//     icon: 'chatbubbles',
//     title: 'Real-time Conversations',
//     description: 'Join channels, create groups, and chat with members instantly. Stay connected wherever you are.',
//     gradient: ['#f093fb', '#f5576c'],
//   },
//   {
//     id: '3',
//     icon: 'notifications',
//     title: 'Stay Updated',
//     description: 'Never miss important updates. Get instant notifications for messages, posts, and community activities.',
//     gradient: ['#4facfe', '#00f2fe'],
//   },
//   {
//     id: '4',
//     icon: 'rocket',
//     title: "Let's Get Started",
//     description: 'Join channels, share your thoughts, and become part of the Sarvadhi community today!',
//     gradient: ['#43e97b', '#38f9d7'],
//   },
// ];

// export default function OnboardingScreen() {
//   const router = useRouter();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const slidesRef = useRef<FlatList>(null);

//   const viewableItemsChanged = useRef(({ viewableItems }: any) => {
//     if (viewableItems.length > 0) {
//       setCurrentIndex(viewableItems[0].index);
//     }
//   }).current;

//   const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

//   const scrollTo = () => {
//     if (currentIndex < slides.length - 1) {
//       slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
//     } else {
//       handleGetStarted();
//     }
//   };

//   const handleGetStarted = async () => {
//     try {
//       await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
//       router.replace('/(auth)/login');
//     } catch (error) {
//       console.error('Error saving onboarding status:', error);
//       router.replace('/(auth)/login');
//     }
//   };

//   const handleSkip = async () => {
//     await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
//     router.replace('/(auth)/login');
//   };

//   const renderItem = ({ item, index }: { item: OnboardingSlide; index: number }) => {
//     return (
//       <View style={styles.slide}>
//         <LinearGradient
//           colors={item.gradient}
//           style={styles.gradientBackground}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <View style={styles.iconContainer}>
//             {index === 0 ? (
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require('../assets/images/logo.jpg')}
//                   style={styles.logo}
//                   resizeMode="contain"
//                 />
//               </View>
//             ) : (
//               <View style={styles.iconCircle}>
//                 <Ionicons name={item.icon} size={80} color="#fff" />
//               </View>
//             )}
//           </View>

//           <View style={styles.textContainer}>
//             <Text style={styles.title}>{item.title}</Text>
//             <Text style={styles.description}>{item.description}</Text>
//           </View>
//         </LinearGradient>
//       </View>
//     );
//   };

//   const Paginator = () => {
//     return (
//       <View style={styles.paginatorContainer}>
//         {slides.map((_, i) => {
//           const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

//           const dotWidth = scrollX.interpolate({
//             inputRange,
//             outputRange: [10, 20, 10],
//             extrapolate: 'clamp',
//           });

//           const opacity = scrollX.interpolate({
//             inputRange,
//             outputRange: [0.3, 1, 0.3],
//             extrapolate: 'clamp',
//           });

//           return (
//             <Animated.View
//               style={[
//                 styles.dot,
//                 {
//                   width: dotWidth,
//                   opacity,
//                 },
//               ]}
//               key={i.toString()}
//             />
//           );
//         })}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
      
//       {/* Skip Button */}
//       {currentIndex < slides.length - 1 && (
//         <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
//           <Text style={styles.skipText}>Skip</Text>
//         </TouchableOpacity>
//       )}

//       <FlatList
//         data={slides}
//         renderItem={renderItem}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         pagingEnabled
//         bounces={false}
//         keyExtractor={(item) => item.id}
//         onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
//           useNativeDriver: false,
//         })}
//         scrollEventThrottle={32}
//         onViewableItemsChanged={viewableItemsChanged}
//         viewabilityConfig={viewConfig}
//         ref={slidesRef}
//       />

//       {/* Bottom Controls */}
//       <View style={styles.bottomContainer}>
//         <Paginator />
        
//         <TouchableOpacity
//           style={styles.nextButton}
//           onPress={scrollTo}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.nextButtonText}>
//             {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
//           </Text>
//           <Ionicons
//             name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
//             size={20}
//             color="#fff"
//             style={{ marginLeft: 8 }}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   slide: {
//     width,
//     height,
//   },
//   gradientBackground: {
//     flex: 1,
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   iconContainer: {
//     flex: 0.6,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   iconCircle: {
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   logoContainer: {
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 10,
//     padding: 10,
//   },
//   logo: {
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//   },
//   textContainer: {
//     flex: 0.4,
//     paddingHorizontal: 30,
//     paddingBottom: 20,
//     justifyContent: 'flex-start',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   description: {
//     fontSize: 15,
//     color: '#fff',
//     textAlign: 'center',
//     lineHeight: 22,
//     opacity: 0.95,
//   },
//   skipButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     zIndex: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     backgroundColor: 'rgba(255, 255, 255, 0.25)',
//     borderRadius: 16,
//   },
//   skipText: {
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   bottomContainer: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 30,
//   },
//   paginatorContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   dot: {
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#fff',
//     marginHorizontal: 8,
//   },
//   nextButton: {
//     backgroundColor: '#fff',
//     paddingVertical: 14,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   nextButtonText: {
//     color: '#333',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STORAGE_KEYS } from '@/config/constants';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: [string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'people-circle',
    title: 'Welcome to Sarvadhi',
    description:
      'Connect with your community, share ideas, and build meaningful relationships in one place.',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    icon: 'chatbubbles',
    title: 'Real-time Conversations',
    description:
      'Join channels, create groups, and chat instantly. Stay connected wherever you are.',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    icon: 'notifications',
    title: 'Stay Updated',
    description:
      'Never miss important updates. Get instant notifications for messages and activities.',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '4',
    icon: 'rocket',
    title: "Let’s Get Started",
    description:
      'Join channels, share your thoughts, and become part of the Sarvadhi community today.',
    gradient: ['#43e97b', '#38f9d7'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    router.replace('/(auth)/login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    router.replace('/(auth)/login');
  };

  const renderItem = ({ item, index }: any) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={{ opacity, transform: [{ scale }] }}>
            <View style={styles.iconContainer}>
              {index === 0 ? (
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../assets/images/logo.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={70} color="#fff" />
                </View>
              )}
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  };

  const Paginator = () => (
    <View style={styles.paginatorContainer}>
      {slides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [6, 18, 6],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i.toString()}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.bottomContainer}>
        <Paginator />

        <TouchableOpacity
          style={styles.nextButton}
          onPress={scrollTo}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1
              ? 'Get Started'
              : 'Continue'}
          </Text>
          <Ionicons
            name={
              currentIndex === slides.length - 1
                ? 'checkmark'
                : 'arrow-forward'
            }
            size={18}
            color="#111"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  slide: {
    width,
    height,
  },

  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  iconContainer: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },

  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 149,
    height: 145,
    borderRadius: 80,
  },

  textContainer: {
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.5,
  },

  description: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },

  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },

  skipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '500',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  paginatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },

  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginHorizontal: 6,
  },

  nextButton: {
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
});
