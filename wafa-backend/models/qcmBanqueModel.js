import mongoose from "mongoose";

const qcmBanqueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: [true, "Name must be unique"],
            required: [true, "Name is required"]
        },
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: [true, "Module ID is required"]
        },
        imageUrl: {
            type: String,
        },
        infoText: {
            type: String,
        }
    },
    { timestamps: true }
);

export default mongoose.model("QCMBanque", qcmBanqueSchema);
