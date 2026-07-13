import type { Track } from "./trackTypes";

export async function getTracks(): Promise<Track[]> {
  const response = await fetch("/api/tracks");

  if (!response.ok) {
    throw new Error(`Failed to retrieve tracks: HTTP ${response.status}`);
  }

  const tracks: Track[] = await response.json();

/*   console.log("Tracks received from API:", tracks);
  console.log("Number of tracks:", tracks.length); */

  return tracks;
}