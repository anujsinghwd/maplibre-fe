import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // For additional DOM matchers
import Map from './Map';


// Mock the maplibregl library and its methods
// In your test setup (e.g., setupTests.ts)
jest.mock('maplibre-gl', () => ({
    Map: jest.fn()
}));

test('renders map container and search bar', () => {
    render(<Map />);

    const mapContainer = screen.getByTestId('map-container');
    const searchInput = screen.getByPlaceholderText('Search for a location...');

    expect(mapContainer).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();
});
