import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.css';

/**
 * SearchBar Component
 *
 * This component provides an auto-suggest search bar integrated with MapLibre map.
 * It fetches location suggestions from an external API and displays them as the user types.
 *
 * @param {Object} map - The MapLibre map instance.
 */
const SearchBar: React.FC<{ map: maplibregl.Map }> = ({ map }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const debounceTimeout = useRef<number | null>(null); // Reference to store the timeout ID

    useEffect(() => {
        /**
         * Search function
         *
         * Fetches location suggestions based on the user's query.
         */
        const search = async () => {
            try {
                if (query) {
                    // Fetch location suggestions using an external API.
                    const response = await fetch(
                        `http://localhost:3002/search?text=${query}`
                    );

                    const data = await response.json();
                    const suggestedPlaces = data.map((item: any) => item.city);

                    setSuggestions(suggestedPlaces);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        };

        // Clear the previous debounce timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Set a new debounce timeout
        debounceTimeout.current = window.setTimeout(() => {
            search();
        }, 300); // Adjust the debounce time (in milliseconds) as needed

        // Cleanup: Clear the debounce timeout when the component unmounts or query changes
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [query]);

    /**
     * Handles input change event
     *
     * Updates the query state as the user types in the search input.
     *
     * @param {Object} event - The input change event.
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    /**
     * Handles suggestion click event
     *
     * Sets the query to the clicked suggestion and clears the suggestions list.
     *
     * @param {string} suggestion - The clicked suggestion.
     */
    const handleSuggestionClick = (suggestion: any) => {
        console.log(suggestion);
        setSuggestions([]);
    };

    /**
     * Clear the search query and suggestions.
     */
    const handleClearClick = () => {
        // Clear the search query
        setQuery('');

        // Clear the list of suggestions
        setSuggestions([]);
    };


    return (
        <div className="search-container">
            {/* Input for searching locations */}
            <input
                type="text"
                placeholder="Search for a location..."
                value={query}
                onChange={handleInputChange}
                ref={searchInputRef}
            />

            {/* Clear icon displayed when query is not empty */}
            {query && (
                <>
                    <FontAwesomeIcon
                        icon={faTimes}
                        className="clear-icon"
                        onClick={handleClearClick}
                    />
                    <FontAwesomeIcon
                        icon={faAdd}
                        className="add-icon"
                        onClick={handleClearClick}
                    />
                </>
            )}

            {/* Suggestions list */}
            <ul className="suggestions">
                {/* Map through suggestions and render each suggestion */}
                {suggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(suggestions)}>
                        {suggestion}
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default SearchBar;
