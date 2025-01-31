import { readData } from "@/utils/store";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import tw from "twrnc";

interface SongSelectorProps {
  searchTerm: string;
  selectedSongs: string[];
  onChange: (song: string) => void;
}

const SongSelector = ({
  onChange,
  selectedSongs,
  searchTerm,
}: SongSelectorProps) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>(songs);

  useEffect(() => {
    async function getSongs() {
      const data = await readData<Song[]>("songs");
      if (data !== null) {
        setSongs(data);
      }
    }

    getSongs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = songs
        .filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.artist.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) => a.title.localeCompare(b.title));
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(songs.sort((a, b) => a.title.localeCompare(b.title)));
    }
  }, [searchTerm, songs]);

  return (
    <GestureHandlerRootView style={tw`mt-1 flex-1`}>
      <ScrollView>
        <View style={tw`gap-1`}>
          {filteredSongs.map((song) => (
            <BouncyCheckbox
              key={song.id}
              size={26}
              isChecked={selectedSongs.some(
                (selectedSong) => selectedSong === song.id,
              )}
              fillColor="#8b5cf6"
              unFillColor="#FFFFFF"
              innerIconStyle={{ borderWidth: 2 }}
              style={tw`items-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2`}
              onPress={() => onChange(song.id)}
              textComponent={
                <View
                  style={tw`flex-1 flex-row items-center justify-between gap-3`}
                >
                  <View style={tw`items-start`}>
                    <Text style={tw`text-base`}>{song.title}</Text>
                    <Text style={tw`text-sm text-violet-500`}>
                      {song.artist}
                    </Text>
                  </View>
                  <Text style={tw`text-2xl font-semibold text-violet-500`}>{song.key}</Text>
                </View>
              }
            />
          ))}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default SongSelector;
