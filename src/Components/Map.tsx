import React, { useRef, useEffect } from 'react';
import maplibregl, { Map as MapboxMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapConfig from '../constants/map';
import './map.css';
import SearchBar from './Searchbar';

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

        // Listen for the 'load' event of the map.
        mapInstance.current.on('load', () => {
            // Check if the mapInstance reference is valid.
            if (mapInstance.current) {
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

        // Clean up function to remove the map instance when the component unmounts.
        return () => {
            // Check if the mapInstance reference is valid.
            if (mapInstance.current) {
                mapInstance.current.remove(); // Remove the map instance to prevent memory leaks.
            }
        };
    }, []);

    return (
        <div>
            <div ref={mapContainer} className="map-container" data-testid="map-container" />
            <SearchBar map={mapInstance.current!} /> {/* Add the SearchBar component */}
        </div>

    );
};

export default Map;