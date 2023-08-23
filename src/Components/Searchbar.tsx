import React, { useState, useRef, useEffect } from 'react';
import { FaLocationDot } from "react-icons/fa6";
import { AiFillPlusCircle, AiFillCloseCircle } from "react-icons/ai";
import './SearchBar.css';
import maplibregl from 'maplibre-gl';

/**
 * SearchBar Component
 *
 * This component provides an auto-suggest search bar integrated with MapLibre map.
 * It fetches location suggestions from an external API and displays them as the user types.
 *
 * @param {Object} map - The MapLibre map instance.
 */
const SearchBar: React.FC<{
    map: maplibregl.Map,
    handleDrawLine: any,
    addMarker: any,
    removeAllMarkers: any,
    handleRemoveLine: any
}> = ({
    map,
    handleDrawLine,
    addMarker,
    removeAllMarkers,
    handleRemoveLine
}) => {
        const [suggestions, setSuggestions] = useState<string[]>([]);
        const debounceTimeout = useRef<number | null>(null); // Reference to store the timeout ID
        const [focusedInputIndex, setFocusedInputIndex] = useState<number | null>(null);
        const searchInputRef = useRef<HTMLInputElement | null>(null);
        const [inputList, setInputList] = useState([
            {
                value: '',
                data: null
            }
        ]);
        const [isFocused, setIsFocused] = useState(false);



        useEffect(() => {

            const isValid = inputList?.every(data => (data?.data && data?.value));
            if (inputList?.length > 1) {
                if (isValid) {
                    const data = inputList.map((list: any) => ([list.data.lng, list.data.lat]));
                    handleDrawLine(data);
                }
            }

            if(inputList?.length > 0 && inputList?.length < 2 && isValid) {
                handleRemoveLine();
            }

            const isValidSome = inputList.some(data => (data?.data && data?.value));
            if (inputList?.length > 0 && isValidSome) {
                inputList.forEach((data: any) => {
                    if (data?.data?.lat && data?.data?.lng) {
                        addMarker([data.data.lng, data.data.lat])
                    }
                })
            }

            const handleDocumentClick = (event: MouseEvent) => {
                // Close suggestions and clear focus when clicking outside the component
                if (isFocused && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                    setSuggestions([]);
                    // setFocusedInputIndex(null);
                    setIsFocused(false);
                }
            };

            document.addEventListener('click', handleDocumentClick);

            const search = async () => {
                try {
                    if (focusedInputIndex !== null && inputList[focusedInputIndex].value) {
                        // Fetch location suggestions using an external API for the focused input
                        const response = await fetch(
                            `http://localhost:3002/search?text=${inputList[focusedInputIndex].value}`
                        );

                        const data = await response.json();
                        // const suggestedPlaces = data.map((item: any) => item.city);

                        setSuggestions(data);
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
                document.removeEventListener('click', handleDocumentClick);
            };
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [inputList, focusedInputIndex, isFocused]);

        /**
         * Handles input change event
         *
         * Updates the query state as the user types in the search input.
         *
         * @param {Object} event - The input change event.
         */
        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
            const newInputList = [...inputList];
            newInputList[index].value = event.target.value;
            setInputList(newInputList);
        };


        const handleSuggestionClick = (suggestion: any) => {
            if (focusedInputIndex !== null) {
                removeAllMarkers();
                const newInputList = [...inputList];
                newInputList[focusedInputIndex].value = suggestion.city;
                newInputList[focusedInputIndex].data = suggestion;
                setInputList(newInputList);
            }

            setFocusedInputIndex(null);
            // Clear the suggestions
            setSuggestions([]);
        };

        const handleAddInput = () => {
            setInputList([...inputList, { value: '', data: null }]);
        };

        const handleInputFocus = (index: number) => {
            setFocusedInputIndex(index);
            setIsFocused(true);
        };

        const handleRemoveInput = (indexToRemove: number) => {
            setInputList(inputList.filter((_, index) => index !== indexToRemove));
        };

        return (
            <div className="search-container">
                {/* Input for searching locations */}
                {inputList.map((input, Idx) => (
                    <div key={Idx} className="input-container">
                        <input
                            key={Idx}
                            type="text"
                            value={input.value}
                            onChange={(event) => handleInputChange(event, Idx)}
                            placeholder="Search for a location..."
                            onFocus={() => handleInputFocus(Idx)}
                            ref={searchInputRef}
                        />
                        {Idx > 0 ? (
                            <AiFillCloseCircle
                                size={18}
                                className="remove-icon"
                                onClick={() => handleRemoveInput(Idx)}
                            />
                        ) : (
                            <FaLocationDot size={18} />
                        )}
                    </div>
                ))}
                <>
                    <AiFillPlusCircle
                        size={18}
                        className="add-icon"
                        onClick={handleAddInput}
                    />
                </>

                {/* Suggestions list */}
                <ul className="suggestions">
                    {/* Map through suggestions and render each suggestion */}
                    {suggestions.map((suggestion: any, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion?.city}
                        </li>
                    ))}
                </ul>
            </div>

        );
    };

export default SearchBar;
