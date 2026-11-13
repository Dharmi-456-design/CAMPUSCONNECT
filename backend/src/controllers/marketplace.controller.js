const MarketplaceListing = require('../models/MarketplaceListing');
const Bookmark = require('../models/Bookmark');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary } = require('../middleware/upload.middleware');

// @desc    Create marketplace listing
// @route   POST /api/marketplace
// @access  Private
const createListing = asyncHandler(async (req, res) => {
  const { title, description, category, price, condition, location, imageUrl, images } = req.body;

  const imageUrls = [];
  if (images) {
    if (Array.isArray(images)) imageUrls.push(...images);
    else if (typeof images === 'string') imageUrls.push(images);
  } else if (imageUrl) {
    imageUrls.push(imageUrl);
  }

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.buffer, 'campusconnect/marketplace');
        imageUrls.push(result.secure_url);
      } catch (err) {
        console.error('Cloudinary upload error:', err);
      }
    }
  }

  const listing = await MarketplaceListing.create({
    title,
    description,
    category,
    price: Number(price),
    condition: condition || 'used',
    location: location || '',
    images: imageUrls,
    seller: req.user._id,
    status: 'available'
  });

  return ApiResponse.success(res, 'Marketplace listing created successfully', { listing }, 201);
});

// @desc    Get marketplace listings (filtered, search, paginated)
// @route   GET /api/marketplace
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  const { category, status = 'available', minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;

  const query = { status };

  if (category && category !== 'All') {
    const escaped = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.category = new RegExp(escaped, 'i');
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: new RegExp(escaped, 'i') },
      { description: new RegExp(escaped, 'i') },
      { category: new RegExp(escaped, 'i') },
      { location: new RegExp(escaped, 'i') }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const listings = await MarketplaceListing.find(query)
    .populate('seller', 'name college branch photoUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await MarketplaceListing.countDocuments(query);

  return ApiResponse.success(res, 'Listings retrieved successfully', {
    listings,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get listing detail by ID
// @route   GET /api/marketplace/:id
// @access  Public
const getListingById = asyncHandler(async (req, res) => {
  const listing = await MarketplaceListing.findById(req.params.id).populate('seller', 'name college branch photoUrl');

  if (!listing) {
    return ApiResponse.error(res, 'Listing not found', [], 404);
  }

  return ApiResponse.success(res, 'Listing details retrieved', { listing });
});

// @desc    Update listing status (owner only)
// @route   PATCH /api/marketplace/:id/status
// @access  Private (Owner Only)
const updateListingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const listing = await MarketplaceListing.findById(req.params.id);

  if (!listing) {
    return ApiResponse.error(res, 'Listing not found', [], 404);
  }

  if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to update status for this listing', [], 403);
  }

  listing.status = status;
  await listing.save();

  return ApiResponse.success(res, `Listing status updated to ${status}`, { listing });
});

// @desc    Toggle favorite listing
// @route   POST /api/marketplace/:id/favorite
// @access  Private
const toggleFavoriteListing = asyncHandler(async (req, res) => {
  const listingId = req.params.id;
  const userId = req.user._id;

  const existing = await Bookmark.findOne({ user: userId, targetType: 'listing', targetId: listingId });

  if (existing) {
    await existing.deleteOne();
    return ApiResponse.success(res, 'Listing removed from favorites', { isFavorite: false });
  } else {
    await Bookmark.create({ user: userId, targetType: 'listing', targetId: listingId });
    return ApiResponse.success(res, 'Listing added to favorites', { isFavorite: true });
  }
});

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListingStatus,
  toggleFavoriteListing
};
