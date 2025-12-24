import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '@/services/userService';

const SemesterContext = createContext();

export const SemesterProvider = ({ children }) => {
    // Initialize from localStorage for instant display
    const [selectedSemester, setSelectedSemester] = useState(() => {
        const cached = localStorage.getItem('userProfile');
        if (cached) {
            const user = JSON.parse(cached);
            return user.semesters?.[0] || null;
        }
        return null;
    });
    const [userSemesters, setUserSemesters] = useState(() => {
        const cached = localStorage.getItem('userProfile');
        if (cached) {
            const user = JSON.parse(cached);
            return user.semesters || [];
        }
        return [];
    });
    const [loading, setLoading] = useState(false);

    // Fetch user profile to get subscribed semesters
    useEffect(() => {
        const fetchUserSemesters = async () => {
            try {
                // Only show loading if we don't have cached data
                if (userSemesters.length === 0) {
                    setLoading(true);
                }
                
                const userProfile = await userService.getUserProfile();
                const semesters = userProfile.semesters || [];
                setUserSemesters(semesters);

                // Set default semester to the first subscribed semester
                if (semesters.length > 0 && !selectedSemester) {
                    setSelectedSemester(semesters[0]);
                }

                // Update localStorage with latest user data
                localStorage.setItem("user", JSON.stringify(userProfile));
            } catch (error) {
                console.error("Error fetching user semesters:", error);
                // Fallback to localStorage - already initialized above
            } finally {
                setLoading(false);
            }
        };

        fetchUserSemesters();
    }, []);

    const value = {
        selectedSemester,
        setSelectedSemester,
        userSemesters,
        loading,
    };

    return (
        <SemesterContext.Provider value={value}>
            {children}
        </SemesterContext.Provider>
    );
};

export const useSemester = () => {
    const context = useContext(SemesterContext);
    if (!context) {
        throw new Error('useSemester must be used within a SemesterProvider');
    }
    return context;
};

export default SemesterContext;
