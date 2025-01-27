import useDebounce from "@/hooks/use-debounce";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import {
  Text,
  TextInput,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
// import SongCard from "@/components/song-card";
import ReactNativeModal from "react-native-modal";
import RNPickerSelect from "react-native-picker-select";
import { createData, readData, updateData } from "@/utils/store";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

const schema = z.object({
  id: z.string().or(z.number()),
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  key: z.string().max(2).min(1, "Key is required"),
});

type Schema = z.infer<typeof schema>;

const SongListScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [data, setData] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Song[]>(data);
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedSong, setSelectedSong] = useState<Song>({} as Song);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
      title: "",
      artist: "",
      key: "",
    },
  });

  useEffect(() => {
    async function getData() {
      const savedData = await readData<Song[]>("songs");
      if (savedData !== null) {
        setData(savedData);
      }
    }

    getData();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = data
        .filter(
          (item) =>
            item.title
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()) ||
            item.artist
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()),
        )
        .sort((a, b) => a.title.localeCompare(b.title));
      setFilteredData(filtered);
    } else {
      setFilteredData(data.sort((a, b) => a.title.localeCompare(b.title)));
    }
  }, [debouncedSearchTerm, data]);

  const onSubmit = async (values: Schema) => {
    if (mode === "create") {
      const finalData = {
        ...values,
        id: Math.random().toString(36).slice(2, 7),
      };
      await createData("songs", [...data, finalData]);
      setData((prev) => [...prev, finalData]);
    } else {
      const updatedSongs = data.map((song) =>
        song.id === values.id ? { ...song, ...values } : song,
      );
      await updateData("songs", updatedSongs);
      setData(updatedSongs);
    }
    setOpenModal(false);
  };

  const handleEdit = () => {
    bottomSheetRef.current?.close();
    setMode("edit");
    setValue("artist", selectedSong.artist);
    setValue("id", selectedSong.id);
    setValue("title", selectedSong.title);
    setValue("key", selectedSong.key);
    setOpenModal(true);
  };

  const handleDelete = async () => {
    const updatedSongs = data.filter((song) => song.id !== selectedSong.id);
    await updateData("songs", updatedSongs);
    setData(updatedSongs);
    bottomSheetRef.current?.close();
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="flex-1">
        <View className="min-h-[110px] gap-3 bg-white px-5">
          <View className="flex-row items-center justify-between pt-3">
            <Text className="text-2xl font-bold text-violet-500">Songs</Text>
            <Pressable
              onPress={() => {
                setMode("create");
                setOpenModal(true);
              }}
            >
              <FontAwesome5 name="plus-circle" size={24} color="#8b5cf6" />
            </Pressable>
          </View>
          <View className="relative flex-1">
            <TextInput
              placeholder="Search..."
              className="rounded-full border-2 border-violet-500 pl-12 text-lg"
              onChangeText={setSearchTerm}
            />
            <View className="absolute left-4 top-4">
              <FontAwesome5 name="search" size={20} color="#8b5cf6" />
            </View>
          </View>
        </View>
        <ScrollView>
          <FlashList
            data={filteredData}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id}
                className="my-3 flex-row items-center justify-between px-5"
                onLongPress={() => {
                  setSelectedSong(item);
                  bottomSheetRef.current?.expand();
                }}
              >
                <View className="gap-1">
                  <Text className="text-xl">{item.title}</Text>
                  <Text className="text-base text-violet-500">
                    {item.artist}
                  </Text>
                </View>
                <Text className="text-xl">{item.key}</Text>
                {/* <Pressable onPress={() => handleEdit(item)}>
                  <Text className="text-lg">Edit</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(item.id)}>
                  <Text className="text-lg">Delete</Text>
                </Pressable> */}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View className="h-96 items-center justify-center">
                <Text className="text-4xl text-gray-300">No Songs yet!</Text>
              </View>
            )}
            estimatedItemSize={200}
          />
          <ReactNativeModal
            isVisible={openModal}
            animationIn="slideInUp"
            animationOut="slideOutUp"
            onBackButtonPress={() => setOpenModal(false)}
            onModalHide={() => reset()}
            avoidKeyboard
          >
            <View className="min-h-[300px] gap-5 rounded-2xl bg-white px-7 py-9">
              <Text className="text-2xl font-bold text-violet-500">
                Add Song
              </Text>
              <View className="gap-3">
                <View className="gap-1">
                  <Text className="text-lg">Song Title:</Text>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <TextInput
                        placeholder="Title"
                        className="rounded-2xl border-2 border-violet-500 px-5 text-lg"
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                  {errors.title?.message && (
                    <Text className="text-base text-red-500">
                      {errors.title?.message}
                    </Text>
                  )}
                </View>
                <View className="gap-1">
                  <Text className="text-lg">Artist:</Text>
                  <Controller
                    control={control}
                    name="artist"
                    render={({ field }) => (
                      <TextInput
                        placeholder="Artist"
                        className="rounded-2xl border-2 border-violet-500 px-5 text-lg"
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                  {errors.artist?.message && (
                    <Text className="text-base text-red-500">
                      {errors.artist?.message}
                    </Text>
                  )}
                </View>
                <View className="gap-1">
                  <Text className="text-lg">Key:</Text>
                  <Controller
                    control={control}
                    name="key"
                    render={({ field }) => (
                      <RNPickerSelect
                        style={{
                          viewContainer: {
                            borderWidth: 2,
                            borderColor: "#8b5cf6",
                            borderRadius: 16,
                          },
                          placeholder: {
                            color: "gray",
                          },
                        }}
                        value={field.value}
                        placeholder={{ label: "Key", value: "" }}
                        onValueChange={field.onChange}
                        items={[
                          { label: "A", value: "A" },
                          { label: "A#", value: "A#" },
                          { label: "B", value: "B" },
                          { label: "C", value: "C" },
                          { label: "C#", value: "C#" },
                          { label: "D", value: "D" },
                          { label: "D#", value: "D#" },
                          { label: "E", value: "E" },
                          { label: "F", value: "F" },
                          { label: "F#", value: "F#" },
                          { label: "G", value: "G" },
                          { label: "G#", value: "G#" },
                        ]}
                      />
                    )}
                  />
                  {errors.key?.message && (
                    <Text className="text-base text-red-500">
                      {errors.key?.message}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex-row-reverse items-center gap-3">
                <TouchableOpacity
                  className="rounded-2xl border-2 border-black px-5 py-3"
                  onPress={() => setOpenModal(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-2xl bg-violet-500 px-5 py-3"
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text className="text-base text-white">
                    {mode === "create" ? "Add" : "Update"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ReactNativeModal>
        </ScrollView>
      </SafeAreaView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={[100]}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
      >
        <BottomSheetView className="flex-1 gap-3 px-4">
          <TouchableOpacity className="px-2" onPress={() => handleEdit()}>
            <Text className="text-lg font-semibold">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-2" onPress={() => handleDelete()}>
            <Text className="text-lg font-semibold">Delete</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default SongListScreen;
