import { Stack } from "expo-router";
import "./global.css";
import { TutorialProvider } from "./components/tutorial/TutorialProvider";
import TutorialOverlay from "./components/tutorial/TutorialOverlay";

export default function RootLayout() {
  return (
    <TutorialProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <TutorialOverlay />
    </TutorialProvider>
  );
}
