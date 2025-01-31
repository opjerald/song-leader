import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ReactNativeModal from "react-native-modal";
import RNPickerSelect from "react-native-picker-select";
import tw from "twrnc";

import { useEffect, useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  Text,
  TextInput,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Alert,
} from "react-native";

import useDebounce from "@/hooks/use-debounce";
import { createData, readData, updateData } from "@/utils/store";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  id: z.string(),
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

  const onSubmit = (values: Schema) => {
    Alert.alert(mode === "create" ? "Add" : "Edit", "Are you sure?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
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
        },
      },
    ]);
  };

  const handleEdit = () => {
    bottomSheetRef.current?.close();
    setMode("edit");
    reset({ ...selectedSong });
    setOpenModal(true);
  };

  const handleDelete = async () => {
    Alert.alert("Delete", "Do you want to delete this song?", [
      {
        text: "No",
        style: "destructive",
      },
      {
        text: "Yes, Delete!",
        onPress: async () => {
          const updatedSongs = data.filter(
            (song) => song.id !== selectedSong.id,
          );
          await updateData("songs", updatedSongs);
          setData(updatedSongs);
          bottomSheetRef.current?.close();
        },
      },
    ]);
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={tw`flex-1`}>
        <View style={tw`min-h-[110px] gap-3 bg-white px-5`}>
          <View style={tw`flex-row items-center justify-between pt-3`}>
            <Text style={tw`text-xl font-bold text-violet-500`}>Songs</Text>
            <Pressable
              onPress={() => {
                setMode("create");
                setOpenModal(true);
              }}
            >
              <FontAwesome5 name="plus-circle" size={24} color="#8b5cf6" />
            </Pressable>
          </View>
          <View style={tw`relative flex-1`}>
            <TextInput
              placeholder="Search..."
              style={tw`rounded-full border-2 border-violet-500 py-3 pl-10 text-base`}
              onChangeText={setSearchTerm}
            />
            <View style={tw`absolute left-4 top-4`}>
              <FontAwesome5 name="search" size={20} color="#8b5cf6" />
            </View>
          </View>
        </View>
        <ScrollView>
          <View style={tw`flex-1 p-2`}>
            <FlashList
              data={filteredData}
              renderItem={({ item }) => (
                <Pressable
                  key={item.id}
                  style={tw`flex-row items-center justify-between rounded-md bg-white px-5 py-2`}
                  onLongPress={() => {
                    setSelectedSong(item);
                    bottomSheetRef.current?.expand();
                  }}
                >
                  <View>
                    <Text style={tw`text-lg`}>{item.title}</Text>
                    <Text style={tw`text-base text-violet-500`}>
                      {item.artist}
                    </Text>
                  </View>
                  <Text style={tw`text-2xl font-bold text-violet-500`}>
                    {item.key}
                  </Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={tw`h-2`}></View>}
              ListEmptyComponent={() => (
                <View style={tw`min-h-[300px] items-center justify-center`}>
                  <Text style={tw`text-3xl text-gray-300`}>No Songs yet!</Text>
                </View>
              )}
              estimatedItemSize={200}
            />
          </View>
          <ReactNativeModal
            isVisible={openModal}
            animationIn="slideInUp"
            animationOut="slideOutUp"
            onBackButtonPress={() => setOpenModal(false)}
            onModalHide={() => reset()}
            avoidKeyboard
          >
            <View style={tw`min-h-[300px] gap-3 rounded-2xl bg-white p-6`}>
              <Text style={tw`text-xl font-bold text-violet-500`}>
                Add Song
              </Text>
              <View style={tw`gap-2`}>
                <View style={tw`gap-1`}>
                  <Text style={tw`text-base`}>Song Title:</Text>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <TextInput
                        placeholder="Title"
                        style={tw`rounded-full border-2 border-violet-500 px-5 py-3 text-base`}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                  {errors.title?.message && (
                    <Text style={tw`text-sm text-red-500`}>
                      {errors.title?.message}
                    </Text>
                  )}
                </View>
                <View style={tw`gap-1`}>
                  <Text style={tw`text-base`}>Artist:</Text>
                  <Controller
                    control={control}
                    name="artist"
                    render={({ field }) => (
                      <TextInput
                        placeholder="Artist"
                        style={tw`rounded-full border-2 border-violet-500 px-5 py-3 text-base`}
                        onBlur={field.onBlur}
                        onChangeText={field.onChange}
                        value={field.value}
                      />
                    )}
                  />
                  {errors.artist?.message && (
                    <Text style={tw`text-sm text-red-500`}>
                      {errors.artist?.message}
                    </Text>
                  )}
                </View>
                <View style={tw`gap-1`}>
                  <Text style={tw`text-base`}>Key:</Text>
                  <Controller
                    control={control}
                    name="key"
                    render={({ field }) => (
                      <RNPickerSelect
                        style={{
                          viewContainer: {
                            borderWidth: 2,
                            borderColor: "#8b5cf6",
                            borderRadius: 50,
                            paddingLeft: 10,
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
                    <Text style={tw`text-sm text-red-500`}>
                      {errors.key?.message}
                    </Text>
                  )}
                </View>
              </View>
              <View style={tw`flex-row items-center justify-end gap-2`}>
                <TouchableOpacity
                  style={tw`rounded-full bg-violet-500 px-4 py-3`}
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text style={tw`text-white`}>
                    {mode === "create" ? "Add" : "Update"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`rounded-full border-2 border-violet-500 px-4 py-3`}
                  onPress={() => setOpenModal(false)}
                >
                  <Text style={tw`text-violet-500`}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ReactNativeModal>
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
            setSelectedSong({} as Song);
          }
        }}
      >
        <BottomSheetView style={tw`flex-1 gap-3 px-4`}>
          <TouchableOpacity
            style={tw`flex-row items-center gap-2 px-2`}
            onPress={() => handleEdit()}
          >
            <View style={tw`w-5`}>
              <FontAwesome5 name="edit" size={18} color="#8b5cf6" />
            </View>
            <Text style={tw`text-base`}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-row items-center gap-2 px-2`}
            onPress={() => handleDelete()}
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

export default SongListScreen;
