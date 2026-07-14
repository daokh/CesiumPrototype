import * as Cesium from "cesium";
import type { Track } from "../api/trackTypes";

export function addTrackToCesium(viewer: Cesium.Viewer, track: Track): void {
  console.log("Track inside addTrackToCesium:", track);
  const trackName = `${track.label ?? ""}.${track.sublabel ?? ""}`.trim();
  viewer.entities.add({
    id: `track-${track.id}`,
    name: trackName,

    position: Cesium.Cartesian3.fromDegrees(
      track.lon,
      track.lat,
      track.alt ?? 0,
    ),

    point: {
      pixelSize: 12,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  });
}

export function removeTracksFromCesium(viewer: Cesium.Viewer): void {
  const entitiesToRemove = viewer.entities.values.filter((entity) =>
    String(entity.id).startsWith("track-"),
  );

  entitiesToRemove.forEach((entity) => {
    viewer.entities.remove(entity);
  });
}

export function addTracksToCesium(
  viewer: Cesium.Viewer,
  tracks: Track[],
): void {
  tracks.forEach((track) => {
    addTrackToCesium(viewer, track);
  });
}
