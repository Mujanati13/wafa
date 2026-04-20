import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '@/services/userService';

const SemesterContext = createContext();
const SELECTED_SEMESTER_STORAGE_KEY = 'selectedSemester';

const getCachedUserProfile = () => {
    try {
        const cached = localStorage.getItem('userProfile') || localStorage.getItem('user');
        if (!cached) return null;
        return JSON.parse(cached);
    } catch (error) {
        console.error('Error parsing cached user profile:', error);
        return null;
    }
};

export const SemesterProvider = ({ children }) => {
    // Initialize from persisted selected semester for stable UX across route transitions
    const [selectedSemester, setSelectedSemester] = useState(() => {
        const persisted = localStorage.getItem(SELECTED_SEMESTER_STORAGE_KEY);
        const user = getCachedUserProfile();

        if (persisted) {
            if (!Array.isArray(user?.semesters) || user.semesters.includes(persisted)) {
                return persisted;
            }
        }

        return user?.semesters?.[0] || null;
    });

    const [userSemesters, setUserSemesters] = useState(() => {
        const user = getCachedUserProfile();
        if (Array.isArray(user?.semesters)) {
            return user.semesters;
        }
        return [];
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedSemester) {
            localStorage.setItem(SELECTED_SEMESTER_STORAGE_KEY, selectedSemester);
        } else {
            localStorage.removeItem(SELECTED_SEMESTER_STORAGE_KEY);
        }
    }, [selectedSemester]);

    // Fetch user profile to get subscribed semesters
    useEffect(() => {
        const fetchUserSemesters = async () => {
            try {
                // Only show loading if we don't have cached data
                if (userSemesters.length === 0) {
                    setLoading(true);
                }
                
                const userProfile = await userService.getUserProfile(true);
                const semesters = Array.isArray(userProfile?.semesters) ? userProfile.semesters : [];
                setUserSemesters(semesters);

                // Keep selected semester if still valid; otherwise fallback safely
                setSelectedSemester((currentSemester) => {
                    if (semesters.length === 0) return null;

                    if (currentSemester && semesters.includes(currentSemester)) {
                        return currentSemester;
                    }

                    const persisted = localStorage.getItem(SELECTED_SEMESTER_STORAGE_KEY);
                    if (persisted && semesters.includes(persisted)) {
                        return persisted;
                    }

                    return semesters[0];
                });

                // Update localStorage with latest user data
                localStorage.setItem("user", JSON.stringify(userProfile));
                localStorage.setItem("userProfile", JSON.stringify(userProfile));
            } catch (error) {
                console.error("Error fetching user semesters:", error);
                // Fallback to localStorage - already initialized above
            } finally {
                setLoading(false);
            }
        };

        fetchUserSemesters();

        const handleAuthStateChanged = () => {
            fetchUserSemesters();
        };

        window.addEventListener('auth-state-changed', handleAuthStateChanged);
        return () => {
            window.removeEventListener('auth-state-changed', handleAuthStateChanged);
        };
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
