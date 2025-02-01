import { readData, updateData } from "@/utils/store";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Link } from "expo-router";
import tw from "twrnc";
import * as Clipboard from "expo-clipboard";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { getScheduledSongs } from "@/utils/tools";
import { useHideTab } from "@/stores/use-hide-tab";

const LineupsScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule>(
    {} as Schedule,
  );
  const [songs, setSongs] = useState<Song[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const toggleHideTab = useHideTab((state) => state.toggleHideTab);

  const getData = async () => {
    const savedData = await readData<Schedule[]>("schedules");
    const songs = await readData<Song[]>("songs");
    if (savedData !== null) {
      setSchedules(savedData);
    }
    if (songs !== null) {
      setSongs(songs);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleCopySchedule = async (schedule: Schedule) => {
    const scheduleSongs = getScheduledSongs(schedule, songs);
    const copyScheduleText = `${schedule.service_name}\n${scheduleSongs.map((song) => `(${song.key}) ${song.title} - ${song.artist}\n`).join("")}`;
    await Clipboard.setStringAsync(copyScheduleText);
    ToastAndroid.show("Copied", ToastAndroid.SHORT);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      getData();
      setRefreshing(false);
    }, 2000);
  };

  const handleDeleteSchedule = async () => {
    Alert.alert("Delete", "Do you want to delete this schedule?", [
      {
        text: "No",
        style: "destructive",
      },
      {
        text: "Yes, Delete!",
        onPress: async () => {
          const updatedSchedules = schedules.filter(
            (sched) => sched.id !== selectedSchedule.id,
          );
          await updateData("schedules", updatedSchedules);
          setSchedules(updatedSchedules);
          bottomSheetRef.current?.close();
        },
      },
    ]);
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={tw`flex-1`}>
        <View
          style={tw`flex-row items-center justify-between bg-white px-5 py-3`}
        >
          <Text style={tw`text-xl font-bold text-violet-500`}>Schedules</Text>
          <Link href={{ pathname: "/schedules/[id]", params: { id: "new" } }}>
            <FontAwesome5 name="plus-circle" size={24} color="#8b5cf6" />
          </Link>
        </View>
        <ScrollView
          style={tw`flex-1 p-4`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={tw`flex-1`}>
            <FlashList
              data={schedules}
              ItemSeparatorComponent={() => (
                <View style={tw`h-3 bg-transparent`}></View>
              )}
              renderItem={({ item }) => (
                <View key={item.id} style={tw`min-h-40 rounded-xl bg-white`}>
                  <View
                    style={tw`flex-row items-center justify-between rounded-t-md px-3 py-2`}
                  >
                    <Text style={tw`text-lg font-bold text-violet-500`}>
                      {item.service_name}
                    </Text>
                    <View style={tw`flex-row items-center gap-4`}>
                      <Pressable onPress={() => handleCopySchedule(item)}>
                        <FontAwesome6 name="copy" size={20} color="#8b5cf6" />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          toggleHideTab();
                          setSelectedSchedule(item);
                          bottomSheetRef.current?.expand();
                        }}
                      >
                        <FontAwesome5
                          name="ellipsis-h"
                          size={20}
                          color="#8b5cf6"
                        />
                      </Pressable>
                    </View>
                  </View>
                  <View style={tw`px-2 pb-2`}>
                    {getScheduledSongs(item, songs).map((song) => (
                      <Text key={song.id} style={tw`text-base`}>
                        (<Text style={tw`font-bold`}>{song.key}</Text>){" "}
                        {song.title} - {song.artist}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={tw`min-h-[300px] items-center justify-center`}>
                  <Text style={tw`text-3xl text-gray-300`}>
                    No schedules yet
                  </Text>
                </View>
              )}
              estimatedItemSize={20}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={[150]}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        onChange={(index) => {
          if (index === -1) {
            toggleHideTab();
            setSelectedSchedule({} as Schedule);
          }
        }}
      >
        <BottomSheetView style={tw`flex-1 gap-2 px-4`}>
          <Link
            href={{
              pathname: "/schedules/[id]",
              params: { id: selectedSchedule.id },
            }}
            asChild
          >
            <TouchableOpacity style={tw`flex-row items-center gap-2 px-2`}>
              <View style={tw`w-5`}>
                <FontAwesome5 name="edit" size={18} color="#8b5cf6" />
              </View>
              <Text style={tw`text-base`}>Edit</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={tw`flex-row items-center gap-2 px-2`}
            onPress={() => handleDeleteSchedule()}
          >
            <View style={tw`w-5`}>
              <FontAwesome5 name="trash-alt" size={18} color="#8b5cf6" />
            </View>
            <Text style={tw`text-base`}>Delete</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default LineupsScreen;
