import mongoose from "mongoose";

const explanation = new mongoose.Schema(
    {
        
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        title: {
           type:String,
           required: true
       },
       contentText: {
           type: String
       },
       imageUrl: {
           type: String
       },
       status:{
           type: String,
           enum: ["pending", "approved", "rejected"],
           default: "pending"
       }

    },
    { timestamps: true }
);

export default mongoose.model("Explanation", explanation);
