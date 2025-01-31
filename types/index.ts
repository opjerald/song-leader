interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
}

interface Schedule {
  id: string,
  songs: string[];
  service_name: string;
}