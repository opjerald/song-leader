export function getScheduledSongs(schedule: Schedule, songs: Song[]) {
  const songMap = songs.reduce((map: Record<string, Song>, song) => {
    map[song.id] = song;
    return map;
  }, {})

  return schedule.songs.map(songId => songMap[songId]).filter(Boolean);
}