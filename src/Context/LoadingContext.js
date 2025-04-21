import React, { createContext, useContext, useState } from 'react';

// Create a context
const LoadingContext = createContext();

// Provide the context
export function LoadingProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);

    const showLoader = () => setIsLoading(true);
    const hideLoader = () => setIsLoading(false);

    return (
        <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
            {children}
        </LoadingContext.Provider>
    );
}

// Custom hook to use the context
export function useLoading() {
    return useContext(LoadingContext);
}
