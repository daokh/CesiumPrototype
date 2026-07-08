import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import './App.css'

function App() {
	const [count, setCount] = useState(0)
	const viewerRef = useRef<Cesium.Viewer | null>(null);
	const [mousePosition, setMousePosition] = useState({
		lat: 0,
		lon: 0,
	});

	const drawingPoints = useRef<Cesium.Cartesian3[]>([]);
	const drawingEntity = useRef<Cesium.Entity | null>(null);

	useEffect(() => {
		Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZmU2MzViYS05MzliLTQxZTQtYmU3MS0wYjY2NmM3YTllMTUiLCJpZCI6NDUzMTM5LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODMzNTk5NjN9.ZwbfaPF3Bfk3dOiQyKtN4kWtiZOvllEOBB4A7vvwDhI";

		//const viewer = new Cesium.Viewer("cesiumContainer");


		viewerRef.current = new Cesium.Viewer("cesiumContainer");

		viewerRef.current.camera.flyHome(0);

		viewerRef.current.cesiumWidget.screenSpaceEventHandler
			.removeInputAction(
				Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
			);

		// Create mouse handler
		const handler = new Cesium.ScreenSpaceEventHandler(
			viewerRef.current.scene.canvas
		);

		/* Set handler for the mouse move */
		handler.setInputAction(
			(movement: Cesium.MotionEvent) => {
				const viewer = viewerRef.current;
				if (!viewer) return;

				const cartesian = viewer.camera.pickEllipsoid(
					movement.endPosition,
					viewer.scene.globe.ellipsoid
				);

				if (!cartesian) return;

				const cartographic = Cesium.Cartographic.fromCartesian(cartesian);

				setMousePosition({
					lat: Cesium.Math.toDegrees(cartographic.latitude),
					lon: Cesium.Math.toDegrees(cartographic.longitude),
				});
			},
			Cesium.ScreenSpaceEventType.MOUSE_MOVE
		);


		/* Set handler for single mouse click for the polygon */
		handler.setInputAction(
			(click: Cesium.PositionedEvent) => {
				const viewer = viewerRef.current;
				if (!viewer) return;

				const cartesian = viewer.scene.pickPosition(click.position);

				if (!cartesian) return;

				drawingPoints.current.push(cartesian);

				// First point?
				if (!drawingEntity.current) {
					drawingEntity.current = viewer.entities.add({
						polygon: {
							hierarchy: new Cesium.CallbackProperty(() => {
								return new Cesium.PolygonHierarchy(drawingPoints.current);
							}, false),
							material: Cesium.Color.BLUE.withAlpha(0.4),
						},

						polyline: {
							positions: new Cesium.CallbackProperty(() => {
								return drawingPoints.current;
							}, false),
							width: 3,
							material: Cesium.Color.YELLOW,
						},
					});
				}
			},
			Cesium.ScreenSpaceEventType.LEFT_CLICK
		);





		/* Set handler for the mouse double click */
		handler.setInputAction(() => {

			const viewer = viewerRef.current;
			if (!viewer) return;

			if (drawingPoints.current.length < 3)
				return;

			// Make a COPY of the points
			const finishedPoints = [...drawingPoints.current];

			// Close the polygon
			finishedPoints.push(finishedPoints[0]);

			// Remove the temporary drawing polygon
			if (drawingEntity.current) {
				viewer.entities.remove(drawingEntity.current);
			}

			// Create a permanent polygon
			viewer.entities.add({
				polygon: {
					hierarchy: finishedPoints,
					material: Cesium.Color.BLUE.withAlpha(0.4),
				},

				polyline: {
					positions: finishedPoints,
					width: 3,
					material: Cesium.Color.YELLOW,
				},
			});

			// Ready for the next polygon
			drawingEntity.current = null;
			drawingPoints.current = [];

		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


		return () => {
			viewerRef.current?.destroy();
			viewerRef.current = null;
			viewerRef.current = null;
		};

	}, []);




	/** Simple Cesium */
	// useEffect(() => {
	// Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZmU2MzViYS05MzliLTQxZTQtYmU3MS0wYjY2NmM3YTllMTUiLCJpZCI6NDUzMTM5LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODMzNTk5NjN9.ZwbfaPF3Bfk3dOiQyKtN4kWtiZOvllEOBB4A7vvwDhI";

	// const viewer = new Cesium.Viewer("cesiumContainer");

	// viewer.camera.flyHome(0);

	// return () => viewer.destroy();
	// }, []);



	const switchMap = (type: "bing" | "osm" | "esri" | "topo" | "dark") => {
		const viewer = viewerRef.current;
		if (!viewer) return;

		const layers = viewer.imageryLayers;
		layers.removeAll();


		if (type === "bing") {
			layers.add(
				Cesium.ImageryLayer.fromWorldImagery()
			);
		}

		if (type === "osm") {
			layers.addImageryProvider(
				new Cesium.UrlTemplateImageryProvider({
					url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
				})
			);
		}

		if (type === "esri") {
			layers.addImageryProvider(
				new Cesium.UrlTemplateImageryProvider({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
				})
			);
		}

		if (type === "topo") {
			layers.addImageryProvider(
				new Cesium.UrlTemplateImageryProvider({
					url: "https://tile.opentopomap.org/{z}/{x}/{y}.png"
				})
			);
		}

		if (type === "dark") {
			layers.addImageryProvider(
				new Cesium.UrlTemplateImageryProvider({
					url: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
				})
			);
		}
	};


	const flyToCity = (city: "sandiego" | "tokyo" | "hcm") => {
		const viewer = viewerRef.current;
		if (!viewer) return;

		switch (city) {
			case "sandiego":
				viewer.camera.flyTo({
					destination: Cesium.Cartesian3.fromDegrees(
						-117.1611,   // longitude
						32.7157,     // latitude
						1000000            // height (meters)
					),
					duration: 2,
				});
				break;

			case "tokyo":
				viewer.camera.flyTo({
					destination: Cesium.Cartesian3.fromDegrees(
						139.6917,
						35.6895,
						1000000
					),
					duration: 2,
				});
				break;

			case "MiddleEast":
				viewer.camera.flyTo({
					destination: Cesium.Cartesian3.fromDegrees(
						55.2,
						25,
						1000000
					),
					duration: 2,
				});
				break;
		}
	};


	return (
		<>
			<div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>


				{/* CESIUM AREA (IMPORTANT) */}
				<div
					id="cesiumContainer"
					style={{
						flex: 1,
						width: "100%",
						height: "100vh"
					}}
				/>

			</div>

			<div
				style={{
					position: "absolute",
					top: 15,
					left: 15,
					zIndex: 1000,
					background: "white",
					borderRadius: 8,
					padding: "10px",
					boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
				}}
			>
				<label style={{ display: "block", marginBottom: 6 }}>
					Base Map
				</label>

				<select
					onChange={(e) =>
						switchMap(
							e.target.value as "osm" | "esri" | "topo" | "dark"
						)
					}
				>
					<option value="osm">🗺 OpenStreetMap</option>
					<option value="esri">🛰 ESRI Satellite</option>
					<option value="topo">⛰ OpenTopoMap</option>
					<option value="dark">🌙 Dark Matter</option>
				</select>

				<hr />

				<h4 style={{ margin: "8px 0" }}>Fly To</h4>

				<button onClick={() => flyToCity("sandiego")}>
					🇺🇸 San Diego
				</button>

				<button onClick={() => flyToCity("tokyo")}>
					🇯🇵 Tokyo
				</button>

				<button onClick={() => flyToCity("MiddleEast")}>
					ME Middle East
				</button>
			</div>


			<div
				style={{
					position: "absolute",
					bottom: 20,
					left: 20,
					background: "rgba(0,0,0,0.7)",
					color: "white",
					padding: "8px 12px",
					borderRadius: "6px",
					zIndex: 1000,
				}}
			>
				<table>
					<tbody>
						<tr>
							<td>Lat:</td>
							<td>{mousePosition.lat.toFixed(6)}</td>
						</tr>
						<tr>
							<td>Lon:</td>
							<td>{mousePosition.lon.toFixed(6)}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</>
	);
}

export default App
