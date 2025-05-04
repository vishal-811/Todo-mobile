import { useEffect, useRef } from "react";
import { Animated, Text, View, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const backgroundFade = useRef(new Animated.Value(0)).current;
  
  const particleAnims = Array(6).fill(0).map(() => ({
    position: useRef(new Animated.ValueXY({
      x: Math.random() * Dimensions.get('window').width,
      y: Math.random() * Dimensions.get('window').height
    })).current,
    opacity: useRef(new Animated.Value(0)).current,
    size: 5 + Math.random() * 10,
  }));
  
 

  useEffect(() => {
    Animated.timing(backgroundFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 10,
          friction: 2,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        })
      ])
    ).start();

    particleAnims.forEach((particle, i) => {
      setTimeout(() => {
        Animated.timing(particle.opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.position, {
              toValue: {
                x: Math.random() * Dimensions.get('window').width,
                y: Math.random() * Dimensions.get('window').height
              },
              duration: 6000 + Math.random() * 4000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.position, {
              toValue: {
                x: Math.random() * Dimensions.get('window').width,
                y: Math.random() * Dimensions.get('window').height
              },
              duration: 6000 + Math.random() * 4000,
              useNativeDriver: true,
            })
          ])
        ).start();
      }, i * 200);
    });

    const timer = setTimeout(async() => {
       const token = await AsyncStorage.getItem('accessToken');
       if(token){
        router.replace('/(tabs)');
       }else{
        router.replace('/signin');
       }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#0369a1', '#0284c7', '#0ea5e9']} 
        className="w-full h-full absolute"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {particleAnims.map((particle, index) => (
          <Animated.View
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              transform: [
                { translateX: particle.position.x },
                { translateY: particle.position.y }
              ]
            }}
          />
        ))}

        <View className="flex-1 justify-center items-center">
          <Animated.View
            className="items-center z-10"
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >

            <Animated.View
              className="mt-8 items-center"
              style={{
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              }}
            >
              <Text className="text-6xl font-extrabold text-white mb-4 text-center">
                TaskFlow
              </Text>
              <View className="bg-white/20 px-8 py-3 rounded-full backdrop-blur-md shadow-lg">
                <Text className="text-2xl text-white text-center font-medium tracking-widest">
                  Master Your Day
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View 
          className="w-full absolute bottom-0"
          style={{ opacity: backgroundFade }}
        >
          <View className="h-32 bg-white/5 rounded-t-full mx-8" />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}