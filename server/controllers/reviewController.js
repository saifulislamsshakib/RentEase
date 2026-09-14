import Review from "../models/reviewModel.js";
import Property from "../models/propertyModel.js";

// Create Review - Tenant

export const createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    // Validate rating
    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check duplicate review
    const existingReview = await Review.findOne({
      property: propertyId,
      tenant: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this property",
      });
    }

    // Create review
    const review = await Review.create({
      property: propertyId,
      tenant: req.user._id,
      rating: Number(rating),
      comment,
    });

    // Populate tenant information
    await review.populate("tenant", "name email");

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.log("Create review error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Get Reviews for a Property

export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Get reviews
    const reviews = await Review.find({
      property: propertyId,
    })
      .populate("tenant", "name profileImage")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

    const averageRating =
      reviews.length > 0
        ? Number((totalRating / reviews.length).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.log("Get property reviews error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Update Own Review - Tenant

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check review owner
    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review",
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (Number(rating) < 1 || Number(rating) > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Update fields
    if (rating !== undefined) {
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    await review.populate("tenant", "name email");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.log("Update review error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Delete Own Review - Tenant

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check review owner
    if (review.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("Delete review error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
