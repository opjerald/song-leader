import { Text, View } from "react-native";

interface SongCardProps {
  data: {
    id: number;
    title: string;
    artist: string;
    key: string;
  };
}

const SongCard = ({ data }: SongCardProps) => {
  return (
    <View
      key={data.id}
      className="my-3 flex-row items-center justify-between px-5"
    >
      <View className="gap-1">
        <Text className="text-xl capitalize">{data.title}</Text>
        <Text className="text-base text-violet-500">{data.artist}</Text>
      </View>
      <Text className="text-xl">{data.key}</Text>
    </View>
  );
};

export default SongCard;
