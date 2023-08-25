import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // For additional DOM matchers
import Map from './Map';


// Mock the maplibregl library and its methods
jest.mock('maplibre-gl', () => ({
    Map: jest.fn()
}));

test('renders map container and search bar', async() => {
    render(<Map />);

    const mapContainer = screen.getByTestId('map-container');
    const searchInput = screen.getByPlaceholderText('Search for a location...');

    expect(mapContainer).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();
});
