import examModel from "../models/examParYearModel.js";

export const examController = {
    createExam: async (req, res) => {
        try {
            const { name, moduleId, year, imageUrl, infoText } = req.body;
            const newExam = await examModel.create({
                name,
                moduleId,
                year,
                imageUrl,
                infoText
            });
            res.status(201).json({
                success: true,
                data: newExam
            });
        } catch (error) {
            console.error("Error creating exam:", error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};