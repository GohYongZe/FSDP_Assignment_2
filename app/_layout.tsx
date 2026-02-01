import { Stack } from "expo-router";
import { TutorialProvider } from "./components/TutorialProvider";
import './global.css';

export default function RootLayout() {
  return (
    <TutorialProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TutorialProvider>
  );
}
