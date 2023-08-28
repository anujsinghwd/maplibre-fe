/* eslint-disable array-callback-return */
import React, { useRef, useEffect, useState } from 'react';
import maplibregl, { Map as MapboxMap } from 'maplibre-gl';
import { lineString, bbox } from '@turf/turf';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapConfig from '../constants/map';
import './map.css';
import SearchBar from './Searchbar';
import { distance_matrix } from '../api/services';
import Switch from './Switch';

/**
 * Map Component
 *
 * This component renders a Mapbox map using MapLibre library.
 * It initializes and manages the map instance, user location tracking, and navigation controls.
 */
const Map: React.FC = () => {
    // Create a reference to a HTMLDivElement or null.
    // This reference will be used to hold a reference to a <div> element in the DOM.
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const [markers, setMarkers] = useState<maplibregl.Marker[]>([]);
    const [distance, setDistance] = useState([]);
    const [unit, setUnit] = useState<string>('metric');
    const [currentData, setCurrentData] = useState<any>(null);

    // Create a reference to a MapboxMap instance or null.
    // This reference will be used to hold a reference to a MapboxMap object, which represents the MapLibre map instance.
    const mapInstance = useRef<MapboxMap | null>(null);

    // This effect initializes and manages the MapboxMap instance when the component mounts.
    useEffect(() => {
        // Create a new MapboxMap instance and assign it to the mapInstance reference.
        mapInstance.current = new maplibregl.Map({
            container: mapContainer.current!, // The DOM element that will hold the map.
            style: mapConfig.STYLE_URL, // The URL to the map style configuration.
            center: [77.31715220081993, 28.570912915241163], // The initial center of the map.
            zoom: 15, // The initial zoom level of the map.
            minZoom: 0, // The minimum allowed zoom level.
            maxZoom: 22 // The maximum allowed zoom level.
        });

        if (mapInstance?.current) {
            // Listen for the 'load' event of the map.
            mapInstance.current.on('load', () => {
                // Check if the mapInstance reference is valid.
                if (mapInstance?.current) {
                    // Create a GeolocateControl to enable user location tracking.
                    let geolocate = new maplibregl.GeolocateControl({
                        positionOptions: {
                            enableHighAccuracy: true // Enable high accuracy for geolocation.
                        },
                        trackUserLocation: true // Start tracking the user's location.
                    });

                    // Add the GeolocateControl to the map.
                    mapInstance.current.addControl(geolocate);

                    // Create a NavigationControl instance to add navigation controls to the map.
                    let nav = new maplibregl.NavigationControl();

                    // Add the NavigationControl to the map at the bottom-right corner.
                    mapInstance.current.addControl(nav, 'bottom-right');

                    let scale = new maplibregl.ScaleControl({
                        maxWidth: 80,
                        unit: 'imperial'
                    });
                    mapInstance.current.addControl(scale);
                }
            });
        }

        // Clean up function to remove the map instance when the component unmounts.
        return () => {
            // Check if the mapInstance reference is valid.
            if (mapInstance?.current) {
                mapInstance.current.remove(); // Remove the map instance to prevent memory leaks.
            }
            removeAllMarkers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getDistanceMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentData, unit]);

    const handleDrawLine = (data: any) => {
        if (mapInstance?.current) {
            // setCurrentData(data);
            const lineFeature = lineString(data);
            let lineSource = mapInstance.current.getSource('line-source') as maplibregl.GeoJSONSource | undefined;

            if (!lineSource) {
                mapInstance.current.addSource('line-source', {
                    type: 'geojson',
                    data: lineFeature
                });

                mapInstance.current.addLayer({
                    id: 'line-layer',
                    type: 'line',
                    source: 'line-source',
                    paint: {
                        'line-color': '#0074D9',
                        'line-width': 2
                    }
                });
            } else {
                lineSource.setData(lineFeature);
            }

            const boundingBox = bbox(lineFeature);
            // Convert bounding box coordinates to LngLatBounds
            const bounds = new maplibregl.LngLatBounds(
                [boundingBox[0], boundingBox[1]], // [minX, minY]
                [boundingBox[2], boundingBox[3]]  // [maxX, maxY]
            );

            // Fit the map to the calculated bounding box
            mapInstance.current.fitBounds(bounds, {
                padding: 20, // Adjust padding as needed
                animate: true // Whether to use animation while fitting the bounds
            });

        }
    }

    const getDistanceMatrix = async () => {
        const latitudes: number[] = [];
        const longitudes: number[] = [];

        currentData?.forEach((val: any) => {
            latitudes.push(val?.data?.lat);
            longitudes.push(val?.data?.lng);
        });

        const response = await distance_matrix(latitudes, longitudes, unit);
        setDistance(response);
    }

    // Function to add a marker to the map and state
    const addMarker = (element: maplibregl.LngLatLike, name: string) => {
        if (mapInstance.current) {
            const marker = new maplibregl.Marker()
                .setLngLat(element);
            // Create a popup for the marker
            const popup = new maplibregl.Popup({ closeButton: false }) // You can customize options here
            .setHTML(`<h5>${name}</h5>`);

            // Associate the popup with the marker
            marker.setPopup(popup);

            // Add the marker to the map
            marker.addTo(mapInstance.current);
            marker.togglePopup();
            setMarkers(prevMarkers => [...prevMarkers, marker]);

            if(currentData?.length === 1 && currentData?.[0]?.data?.lat) {
                mapInstance.current.flyTo({
                    center: [currentData?.[0]?.data?.lng, currentData?.[0]?.data?.lat]
                });
            }
        }
    };

    // Function to remove all markers from the map and state
    const removeAllMarkers = () => {
        markers.forEach(marker => marker.remove());
        setMarkers([]);
    };

    const handleRemoveLine = () => {
        // Layer ID that you want to remove
        const layerIdToRemove = 'line-layer';

        if (mapInstance?.current && mapInstance?.current?.getLayer) {
            const layerExists = mapInstance.current?.getLayer(layerIdToRemove) !== undefined;
            // Remove the layer from the map
            if (layerExists) {
                mapInstance.current.removeLayer(layerIdToRemove);
            }
        }
    }

    const handleDataChange = (data: any) => {
        setCurrentData(data);
    }

    const handleChangeToggle = (checked: boolean) => {
        if (checked) {
            setUnit('metric');
        } else {
            setUnit('imperial');
        }
    }

    return (
        <div>
            <div ref={mapContainer} className="map-container" data-testid="map-container" />
            {distance?.length > 0 && (
                <div className='distance-container'>
                    <div className='switchbox'>
                        <Switch handleChangeToggle={handleChangeToggle} />
                    </div>
                    {currentData?.length > 1 && distance?.map((val: number, Idx: number) => {
                        if (currentData[Idx+1]?.data?.lat && Idx < currentData?.length) {
                            return (
                                <p key={Idx}>
                                    {`Distance between ${currentData[Idx].value} and ${currentData[Idx+1].value}: ${val.toFixed(2)} ${unit}`}
                                </p>
                            )
                        }
                    })}
                </div>
            )}

            <SearchBar
                handleDrawLine={handleDrawLine}
                addMarker={addMarker}
                removeAllMarkers={removeAllMarkers}
                handleRemoveLine={handleRemoveLine}
                handleDataChange={handleDataChange}
            /> {/* Add the SearchBar component */}
        </div>

    );
};

export default Map;
