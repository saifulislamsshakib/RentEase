import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC USER INFORMATION
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    // =====================================================
    // ROLE
    // =====================================================

    role: {
      type: String,
      enum: ["tenant", "owner", "admin"],
      default: "tenant",
    },

    // =====================================================
    // PROFILE
    // =====================================================

    profileImage: {
      type: String,
      default: "",
    },

    // =====================================================
    // OWNER PAYMENT INFORMATION
    // Used by tenants to make rent/security deposit payments
    // =====================================================

    paymentInformation: {
      bkash: {
        type: String,
        default: "",
        trim: true,
      },

      nagad: {
        type: String,
        default: "",
        trim: true,
      },

      bankName: {
        type: String,
        default: "",
        trim: true,
      },

      accountName: {
        type: String,
        default: "",
        trim: true,
      },

      accountNumber: {
        type: String,
        default: "",
        trim: true,
      },

      branch: {
        type: String,
        default: "",
        trim: true,
      },

      instructions: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
