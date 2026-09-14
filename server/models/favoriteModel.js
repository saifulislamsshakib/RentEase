import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    // যে tenant property favorite করেছে
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // যে property favorite করা হয়েছে
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// একই tenant একই property একবারের বেশি favorite করতে পারবে না
favoriteSchema.index({ tenant: 1, property: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
