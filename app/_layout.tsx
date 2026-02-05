import { Stack } from "expo-router";
import { View } from "react-native";
import "./global.css";
import { TutorialProvider } from "./components/tutorial/TutorialProvider";
import TutorialOverlay from "./components/tutorial/TutorialOverlay";
import { GuideButton } from "./components/tutorial/GuideButton";

export default function RootLayout() {
  return (
    <TutorialProvider>
      <View style={{ flex: 1, position: "relative" }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <GuideButton />
        <TutorialOverlay />
      </View>
    </TutorialProvider>
  );
}
