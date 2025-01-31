import { Stack } from "expo-router";
import { Text, View } from "react-native";

const ScheduleLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default ScheduleLayout;
