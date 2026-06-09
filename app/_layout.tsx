import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
  StatusBar,
} from "react-native";

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get("window");

export default function RootLayout() {
  const [splashVisible, setSplashVisible] = useState(true);

  // Animations
  const fadeAnim   = useRef(new Animated.Value(0)).current; // overlay opacity
  const scaleAnim  = useRef(new Animated.Value(0.82)).current; // poster scale
  const glowAnim   = useRef(new Animated.Value(0)).current; // glow ring
  const titleAnim  = useRef(new Animated.Value(0)).current; // title fade-up
  const titleY     = useRef(new Animated.Value(22)).current;
  const exitAnim   = useRef(new Animated.Value(1)).current; // exit fade

  useEffect(() => {
    async function run() {
      // Hide native splash immediately
      await SplashScreen.hideAsync();

      // ── Entrance animations ──
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 350, useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1, friction: 7, tension: 60, useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1, duration: 800, useNativeDriver: true,
        }),
      ]).start();

      // Title fades in after poster
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(titleAnim, {
            toValue: 1, duration: 500, useNativeDriver: true,
          }),
          Animated.timing(titleY, {
            toValue: 0, duration: 500, useNativeDriver: true,
          }),
        ]).start();
      }, 400);

      // ── Wait 3 seconds total, then fade out ──
      await new Promise((r) => setTimeout(r, 3000));

      Animated.timing(exitAnim, {
        toValue: 0, duration: 600, useNativeDriver: true,
      }).start(() => setSplashVisible(false));
    }

    run();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050C18" />

      <Stack screenOptions={{ contentStyle: { backgroundColor: "#050C18" } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>

      {splashVisible && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.splash, { opacity: exitAnim }]}
          pointerEvents="none"
        >
          {/* Deep background gradient layers */}
          <View style={styles.bgLayer1} />
          <View style={styles.bgLayer2} />

          {/* Glow ring behind poster */}
          <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />
          <Animated.View style={[styles.glowRingInner, { opacity: glowAnim }]} />

          {/* Decorative corner dots */}
          <View style={[styles.cornerDot, styles.dotTL]} />
          <View style={[styles.cornerDot, styles.dotTR]} />
          <View style={[styles.cornerDot, styles.dotBL]} />
          <View style={[styles.cornerDot, styles.dotBR]} />

          {/* Horizontal accent lines */}
          <View style={[styles.accentLine, { top: height * 0.18 }]} />
          <View style={[styles.accentLine, { bottom: height * 0.18 }]} />

          {/* Poster */}
          <Animated.View
            style={[
              styles.posterWrap,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.posterFrame}>
              <Image
                source={require("../assets/images/aziz.jpg")}
                style={styles.poster}
                resizeMode="cover"
              />
              {/* Poster overlay shimmer */}
              <View style={styles.posterOverlay} />
            </View>
          </Animated.View>

          {/* Brand text */}
          <Animated.View
            style={[
              styles.brandWrap,
              {
                opacity: titleAnim,
                transform: [{ translateY: titleY }],
              },
            ]}
          >
            {/* Top line */}
            <View style={styles.brandLineRow}>
              <View style={styles.brandLine} />
              <View style={styles.diamondDot} />
              <View style={styles.brandLine} />
            </View>

            <Text style={styles.brandTitle}>LAST DANCE</Text>
            <Text style={styles.brandSub}>FIFA WORLD CUP 2026™</Text>

            {/* Bottom line */}
            <View style={styles.brandLineRow}>
              <View style={styles.brandLine} />
              <View style={styles.diamondDot} />
              <View style={styles.brandLine} />
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const POSTER_W = width * 0.62;
const POSTER_H = POSTER_W * 1.42;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050C18" },

  // ── Splash ────────────────────────────────────────────────────
  splash: {
    backgroundColor: "#050C18",
    alignItems: "center",
    justifyContent: "center",
  },

  // Background layers
  bgLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#071020",
  },
  bgLayer2: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: "#0A1E3D",
    opacity: 0.45,
    top: height * 0.5 - width * 0.7,
    left: -(width * 0.2),
  },

  // Glow rings
  glowRing: {
    position: "absolute",
    width: POSTER_W + 100,
    height: POSTER_W + 100,
    borderRadius: (POSTER_W + 100) / 2,
    borderWidth: 1,
    borderColor: "#1D4ED8",
    opacity: 0.3,
  },
  glowRingInner: {
    position: "absolute",
    width: POSTER_W + 50,
    height: POSTER_W + 50,
    borderRadius: (POSTER_W + 50) / 2,
    borderWidth: 1,
    borderColor: "#2563EB",
    opacity: 0.18,
  },

  // Corner decorations
  cornerDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1D4ED8",
    opacity: 0.6,
  },
  dotTL: { top: 52, left: 28 },
  dotTR: { top: 52, right: 28 },
  dotBL: { bottom: 52, left: 28 },
  dotBR: { bottom: 52, right: 28 },

  // Accent lines
  accentLine: {
    position: "absolute",
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: "#1D4ED8",
    opacity: 0.12,
  },

  // Poster
  posterWrap: { alignItems: "center" },
  posterFrame: {
    width: POSTER_W,
    height: POSTER_H,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#1D4ED8",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 20,
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A1E3D",
    opacity: 0.08,
  },

  // Brand
  brandWrap: {
    alignItems: "center",
    marginTop: 32,
    gap: 8,
  },
  brandLineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandLine: {
    width: 70,
    height: 1,
    backgroundColor: "#2563EB",
    opacity: 0.6,
  },
  diamondDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    backgroundColor: "#F59E0B",
    transform: [{ rotate: "45deg" }],
  },
  brandTitle: {
    color: "#EEF5FF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 8,
    textAlign: "center",
  },
  brandSub: {
    color: "#2D6A9F",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
  },
});
