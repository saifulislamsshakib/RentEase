import crypto from "crypto";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/email.js";

// Register User
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, phone, address, role } = req.body;

//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, email and password are required",
//       });
//     }

//     // Check existing user
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "User already exists with this email",
//       });
//     }

//     // Password hashing
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//       address,
//       verificationToken,

//       // Public registration থেকে শুধু tenant বা owner
//       role: role === "owner" ? "owner" : "tenant",
//     });

//     // Password response থেকে remove করা
//     const userData = user.toObject();
//     delete userData.password;

//     res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//       user: userData,
//     });
//   } catch (error) {
//     console.log("Register error:", error.message);

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      verificationToken,

      // Public registration থেকে শুধু tenant বা owner
      role: role === "owner" ? "owner" : "tenant",
    });

    // Verification link
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your RentEase account",

      html: `
        <h2>Welcome to RentEase</h2>

        <p>Hello ${user.name},</p>

        <p>
          Please click the button/link below to verify your email address.
        </p>

        <a href="${verificationUrl}">
  Verify Email
</a>

        <p>If you did not create this account, please ignore this email.</p>
      `,
    });

    // Password response থেকে remove করা
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: userData,
    });
  } catch (error) {
    console.log("Register error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login User
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validation
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     // Find user
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }
//     // Check if user is blocked
//     if (!user.isActive) {
//       return res.status(403).json({
//         success: false,
//         message: "Your account has been blocked. Please contact admin.",
//       });
//     }
//     // Compare password
//     const isPasswordMatch = await bcrypt.compare(password, user.password);

//     if (!isPasswordMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     // Generate JWT Token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       },
//     );

//     // Remove password from response
//     const userData = user.toObject();
//     delete userData.password;

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: userData,
//     });
//   } catch (error) {
//     console.log("Login error:", error.message);

//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is blocked
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact admin.",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Remove sensitive data from response
    const userData = user.toObject();

    delete userData.password;
    delete userData.verificationToken;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.log("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    const userData = user.toObject();

    delete userData.password;

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.log("Get profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profileImage, paymentInformation } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =========================
    // Personal Information
    // =========================

    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (address !== undefined) {
      user.address = address;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    // =========================
    // Owner Payment Information
    // =========================

    if (paymentInformation !== undefined && user.role === "owner") {
      user.paymentInformation = {
        bkash: paymentInformation.bkash ?? user.paymentInformation?.bkash ?? "",

        nagad: paymentInformation.nagad ?? user.paymentInformation?.nagad ?? "",

        bankName:
          paymentInformation.bankName ??
          user.paymentInformation?.bankName ??
          "",

        accountName:
          paymentInformation.accountName ??
          user.paymentInformation?.accountName ??
          "",

        accountNumber:
          paymentInformation.accountNumber ??
          user.paymentInformation?.accountNumber ??
          "",

        branch:
          paymentInformation.branch ?? user.paymentInformation?.branch ?? "",

        instructions:
          paymentInformation.instructions ??
          user.paymentInformation?.instructions ??
          "",
      };
    }

    await user.save();

    // =========================
    // Remove Sensitive Data
    // =========================

    const userData = user.toObject();

    delete userData.password;
    delete userData.verificationToken;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpire;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};
// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Change password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log("Email verification error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = verificationToken;

    await user.save();

    // Verification link
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify Your RentEase Account",
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Please click the link below to verify your RentEase account:</p>
        <a href="${verificationLink}">
          Verify Email
        </a>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.log("Resend verification email error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save token
    user.resetPasswordToken = resetToken;

    // Token expires after 10 minutes
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Reset password link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Your RentEase Password",
      html: `
        <h2>Password Reset Request</h2>

        <p>Hello ${user.name},</p>

        <p>You requested to reset your RentEase password.</p>

        <p>Click the link below to reset your password:</p>

        <a href="${resetLink}">
          Reset Password
        </a>

        <p>This link will expire in 10 minutes.</p>

        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Forgot password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;

    // Remove reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Reset password error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Block / Unblock User - Admin

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validate isActive
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    // Update status
    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "unblocked" : "blocked"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.log("Update user status error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Delete User - Admin

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("Delete user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
