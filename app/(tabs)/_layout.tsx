import { Tabs } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8b5cf6",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Songs",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="itunes-note" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: "Schedules",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="rectangle-list" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
