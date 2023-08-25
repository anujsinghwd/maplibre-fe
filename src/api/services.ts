export const autosuggest = async (text: string) => {
    const response = await fetch(
        `http://localhost:3002/search?text=${text}`
    );

    const data = await response.json();
    return data;
};

export const distance_matrix = async (latitudes: number[], longitudes: number[], unit: string = 'imperial') => {
    const requestBody = {
        latitudes,
        longitudes,
        unit
    };

    const response = await fetch('http://localhost:3002/distance-matrix', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })

    const data = await response.json();
    return data;
}
