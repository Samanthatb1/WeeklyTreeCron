import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email_id: {
      type: String,
      required: true,
      unique: true
    },
    links: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
)

export default mongoose.model("User", userSchema);