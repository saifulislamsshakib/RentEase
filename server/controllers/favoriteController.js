import Favorite from "../models/favoriteModel.js";
import Property from "../models/propertyModel.js";

// Add Property to Favorites

export const addFavorite = async (req, res) => {
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

    // Check if already favorite
    const existingFavorite = await Favorite.findOne({
      tenant: req.user._id,
      property: propertyId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Property already added to favorites",
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      tenant: req.user._id,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      message: "Property added to favorites successfully",
      favorite,
    });
  } catch (error) {
    console.log("Add favorite error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get My Favorite Properties

export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      tenant: req.user._id,
    })
      .populate(
        "property",
        "title description propertyType address city rent bedrooms bathrooms images isAvailable owner",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.log("Get favorites error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Remove Property from Favorites

export const removeFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Find favorite
    const favorite = await Favorite.findOne({
      tenant: req.user._id,
      property: propertyId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite property not found",
      });
    }

    // Delete favorite
    await Favorite.findByIdAndDelete(favorite._id);

    res.status(200).json({
      success: true,
      message: "Property removed from favorites successfully",
    });
  } catch (error) {
    console.log("Remove favorite error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
