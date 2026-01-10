import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-5xl text-blue-500 font-bold">Hello.</Text>
      <Text className="text-2xl text-secondary font-bold">Secondary styling test</Text>
      <Text className="text-green-200 font-bold">Third styling test</Text>
      <Link href="/homepage">To Home</Link>
    </View>
    //To link to other pages, need to import Link from expo-router
  );
}
