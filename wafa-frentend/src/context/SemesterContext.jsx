import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '@/services/userService';

const SemesterContext = createContext();

export const SemesterProvider = ({ children }) => {
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [userSemesters, setUserSemesters] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user profile to get subscribed semesters
    useEffect(() => {
        const fetchUserSemesters = async () => {
            try {
                setLoading(true);
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
                // Fallback to localStorage
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    const semesters = user.semesters || [];
                    setUserSemesters(semesters);
                    if (semesters.length > 0 && !selectedSemester) {
                        setSelectedSemester(semesters[0]);
                    }
                }
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
