<div align="center">

# ⚽ Last Dance
### FIFA World Cup 2026 — Personal Schedule Tracker

![Platform](https://img.shields.io/badge/platform-Android-green?style=flat-square&logo=android)
![Expo](https://img.shields.io/badge/Expo-54.0-black?style=flat-square&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)

**Track your favorite teams' matches across the entire FIFA World Cup 2026 tournament.**  
Add teams, detect scheduling conflicts, and build your personal viewing schedule — all in a sleek dark UI.

</div>

---

## 📱 Features

- 🔍 **Search & Add Teams** — Type any country name and instantly filter their matches
- 📅 **Personal Schedule** — See only the games that matter to you, sorted by date
- ⚠️ **Conflict Detection** — Visual indicators when matches overlap or have less than 1 hour gap
- 🗑️ **Dismiss Matches** — Swipe away matches you don't want to watch (with confirmation)
- 💾 **Persistent Storage** — Your selections are saved across app restarts (AsyncStorage)
- 🔄 **Reset Anytime** — One tap to restore everything back to default
- 🌐 **Live Data** — Fetches real World Cup 2026 schedule from a public API
- 🌙 **Dark Mode UI** — Elegant deep navy design, easy on the eyes

---

## 🖼️ Screenshots

> Coming soon — the app will be available as an APK download below.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fifia.git
cd fifia

# Install dependencies
npm install

# Start the dev server
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone.

---

## 📦 Download APK

> APKs are automatically built using GitHub Actions on every push to `main`.

1. Go to the [**Actions**](../../actions) tab
2. Click the latest **"Build Android APK"** workflow run
3. Scroll down to **Artifacts**
4. Download **`last-dance-apk`**

---

## 🏗️ Build It Yourself

### Using GitHub Actions (recommended — no setup needed)

Push your code to the `main` branch. The APK will be built automatically in ~12 minutes.  
See [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) for the workflow config.

### Using EAS Cloud

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile production
```

### Locally (requires Android SDK)

```bash
eas build --local --platform android --profile production
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Expo](https://expo.dev) ~54.0 | App framework & build tooling |
| [React Native](https://reactnative.dev) 0.81 | Cross-platform mobile UI |
| [Expo Router](https://docs.expo.dev/router/introduction/) | File-based navigation |
| [TypeScript](https://www.typescriptlang.org/) 5.9 | Type safety |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Local data persistence |
| [Axios](https://axios-http.com/) | API requests |
| [expo-splash-screen](https://docs.expo.dev/versions/latest/sdk/splash-screen/) | Custom splash screen |

---

## 📁 Project Structure

```
fifia/
├── app/
│   ├── _layout.tsx          # Root layout & navigation
│   └── index.tsx            # Main screen (schedule UI)
├── hooks/
│   ├── useWorldCupSchedule.js  # Fetches & filters match data
│   └── usePersistentState.ts   # AsyncStorage state management
├── assets/
│   └── images/              # App icons & splash screen
├── .github/
│   └── workflows/
│       └── build-apk.yml    # GitHub Actions APK builder
├── app.json                 # Expo config
└── eas.json                 # EAS Build config
```

---

## ⚙️ EAS Build Profiles

| Profile | Type | Use case |
|---|---|---|
| `development` | APK | Dev client for testing |
| `preview` | APK | Internal testers |
| `production` | APK | Final release |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT © 2026 — Built with ❤️ for the beautiful game.
