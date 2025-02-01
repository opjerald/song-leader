import { Tabs } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useHideTab } from "@/stores/use-hide-tab";

const TabLayout = () => {
  const hideTab = useHideTab((state) => state.hideTab);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8b5cf6",
        tabBarStyle: {
          display: hideTab ? "none" : "flex",
        },
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
