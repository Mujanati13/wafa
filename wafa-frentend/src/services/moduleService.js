import { api } from "@/lib/utils";

export const moduleService = {
    // Get all modules
    getAllmodules: async () => {
        try {
            const response = await api.get("/modules");
            return response;
        } catch (error) {
            console.error('Error fetching all modules:', error);
            throw error;
        }
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
