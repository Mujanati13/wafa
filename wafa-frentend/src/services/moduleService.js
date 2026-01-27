import { api } from "@/lib/utils";

// Module cache
let moduleCache = null;
let moduleCacheTime = null;
const MODULE_CACHE_EXPIRY = 60000; // 1 minute cache
let pendingModuleRequest = null;

export const moduleService = {
    // Get all modules with caching
    getAllmodules: async (forceRefresh = false) => {
        try {
            const now = Date.now();

            // Return cached data if valid
            if (!forceRefresh && 
                moduleCache && 
                moduleCacheTime && 
                (now - moduleCacheTime) < MODULE_CACHE_EXPIRY) {
                return { data: moduleCache };
            }

            // If there's already a pending request, wait for it
            if (pendingModuleRequest) {
                return pendingModuleRequest;
            }

            // Try localStorage first for instant display
            if (!forceRefresh) {
                const cached = localStorage.getItem('modules');
                if (cached) {
                    const parsedCache = JSON.parse(cached);
                    // Return cached immediately but still fetch in background
                    moduleCache = { data: parsedCache };
                    moduleCacheTime = now;
                }
            }

            // Create the request
            pendingModuleRequest = (async () => {
                const response = await api.get("/modules");
                moduleCache = response.data;
                moduleCacheTime = Date.now();
                
                // Try to save to localStorage, but don't fail if quota exceeded
                try {
                    localStorage.setItem("modules", JSON.stringify(response.data.data));
                } catch (e) {
                    // Quota exceeded - clear old data and try storing only essential fields
                    console.warn('localStorage quota exceeded, clearing old cache:', e);
                    try {
                        localStorage.removeItem("modules");
                        // Store minimal module data (only what's needed for sidebar)
                        const minimalModules = response.data.data.map(m => ({
                            _id: m._id,
                            name: m.name,
                            semester: m.semester,
                            icon: m.icon
                        }));
                        localStorage.setItem("modules", JSON.stringify(minimalModules));
                    } catch (e2) {
                        console.error('Still cannot save to localStorage:', e2);
                        // Continue without localStorage cache
                    }
                }
                return response;
            })();

            const result = await pendingModuleRequest;
            pendingModuleRequest = null;
            return result;
        } catch (error) {
            pendingModuleRequest = null;
            console.error('Error fetching all modules:', error);
            
            // Return cached data as fallback
            const cached = localStorage.getItem('modules');
            if (cached) {
                return { data: { data: JSON.parse(cached) } };
            }
            throw error;
        }
    },

    // Clear module cache
    clearCache: () => {
        moduleCache = null;
        moduleCacheTime = null;
    },

    // Get module by ID
    getModuleById: async (id) => {
        try {
            const response = await api.get("/modules/" + id);
            return response;
        } catch (error) {
            console.error('Error fetching module by id:', error);
            throw error;
        }
    },

    // Create a new module
    createModule: async (moduleData) => {
        try {
            const response = await api.post("/modules/create", moduleData);
            return response;
        } catch (error) {
            console.error('Error creating module:', error);
            throw error;
        }
    },

    // Update a module
    updateModule: async (id, moduleData) => {
        try {
            const response = await api.put(`/modules/${id}`, moduleData);
            return response;
        } catch (error) {
            console.error('Error updating module:', error);
            throw error;
        }
    },

    // Delete a module
    deleteModule: async (id) => {
        try {
            const response = await api.delete(`/modules/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting module:', error);
            throw error;
        }
    },
};
