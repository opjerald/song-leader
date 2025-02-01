import SongSelector from "@/components/song-selector";
import useDebounce from "@/hooks/use-debounce";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import tw from "twrnc";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router, useLocalSearchParams } from "expo-router";
import { createData, readData, updateData } from "@/utils/store";

const schema = z.object({
  id: z.string(),
  service_name: z.string().min(1, "Service name is required"),
  songs: z.array(z.string()).min(1, "Select at least 1 song"),
});

type Schema = z.infer<typeof schema>;

const ScheduleScreen = () => {
  const { id } = useLocalSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
      service_name: "",
      songs: [],
    },
  });

  useEffect(() => {
    async function getSelectedSchedule() {
      const schedules = await readData<Schedule[]>("schedules");
      if (schedules !== null) {
        const selected = schedules.find((sched) => sched.id === id) ?? {
          id: "",
          service_name: "",
          songs: [],
        };
        reset({ ...selected });
      }
    }

    if (id !== "new") {
      getSelectedSchedule();
    }
  }, [id]);

  const onSubmit = async (values: Schema) => {
    const schedules = (await readData<Schedule[]>("schedules")) ?? [];

    Alert.alert(id === "new" ? "Add" : "Edit", "Are you sure?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          if (id === "new") {
            const finalData = {
              ...values,
              id: Math.random().toString(36).slice(2, 7),
            };
            await createData("schedules", [...schedules, finalData]);
          } else {
            const updatedSchedule = schedules.map((sched) =>
              sched.id === values.id ? { ...sched, ...values } : sched,
            );
            await updateData("schedules", updatedSchedule);
          }

          reset();
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-row items-center gap-3 bg-white p-3`}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={20} color="#8b5cf6" />
        </Pressable>
        <Text style={tw`text-lg font-semibold text-violet-500`}>
          {id === "new" ? "Add" : "Edit"} Schedule
        </Text>
      </View>
      <View style={tw`flex-1 gap-3 px-4 pb-4 pt-2`}>
        <View style={tw`gap-1`}>
          <Text style={tw`text-base`}>Service Name:</Text>
          <Controller
            control={control}
            name="service_name"
            render={({ field }) => (
              <TextInput
                placeholder="Enter name of service"
                style={tw`rounded-full border-2 border-violet-500 px-5 py-3 text-base`}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
              />
            )}
          />
          {errors.service_name?.message && (
            <Text style={tw`text-sm text-red-500`}>
              {errors.service_name.message}
            </Text>
          )}
        </View>
        <View style={tw`flex-1 gap-1`}>
          <Text style={tw`text-base`}>Select Songs:</Text>
          <View style={tw`relative`}>
            <TextInput
              placeholder="Search..."
              style={tw`rounded-full border-2 border-violet-500 py-3 pl-10 text-base`}
              onChangeText={setSearchTerm}
            />
            <View style={tw`absolute left-4 top-4`}>
              <FontAwesome5 name="search" size={20} color="#8b5cf6" />
            </View>
          </View>
          {errors.songs?.message && (
            <Text style={tw`text-sm text-red-500`}>{errors.songs.message}</Text>
          )}
          <View style={tw`mt-1 items-end`}>
            <Pressable
              onPress={() => {
                reset((values) => ({ ...values, songs: [] }));
              }}
            >
              <Text style={tw`text-base text-violet-500`}>Reset</Text>
            </Pressable>
          </View>
          <Controller
            control={control}
            name="songs"
            render={({ field }) => (
              <SongSelector
                searchTerm={debouncedSearchTerm}
                selectedSongs={field.value}
                onChange={(songId) => {
                  if (
                    field.value.some((selectedSong) => selectedSong === songId)
                  ) {
                    const updateSongs = field.value.filter(
                      (selectedSong) => selectedSong !== songId,
                    );
                    field.onChange(updateSongs);
                  } else {
                    field.onChange([...field.value, songId]);
                  }
                }}
              />
            )}
          />
        </View>
        <Pressable
          onPress={handleSubmit(onSubmit)}
          style={tw`items-center rounded-full bg-violet-500 p-3`}
        >
          <Text style={tw`text-base font-medium text-white`}>
            {id === "new" ? "Submit" : "Update"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ScheduleScreen;
