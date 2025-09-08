import { api } from "@/lib/utils";

export const moduleService = {
    getAllmodules: async () => {
        try {
            const responce = await api.get("/modules")
            return responce
        } catch (error) {
            console.error('Error fetching all modules:', error);
            throw error;
        }
    },
    getModuleById: async (id) => {
        try {
            const responce = await api.get("/modules/" + id)
            return responce
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }
}