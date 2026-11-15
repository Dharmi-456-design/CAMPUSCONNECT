const LostFoundItem = require('../models/LostFoundItem');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

// Helper to sanitize contact info based on user's privacy choices
const applyPrivacyFilter = (item, currentUserId, currentUserRole) => {
  const doc = item.toObject ? item.toObject() : { ...item };
  const isOwner =
    currentUserId &&
    doc.user &&
    (doc.user._id ? doc.user._id.toString() : doc.user.toString()) === currentUserId.toString();
  const isAdmin = currentUserRole === 'admin';

  if (!isOwner && !isAdmin && doc.contactInfo) {
    if (!doc.contactInfo.showPhone) {
      delete doc.contactInfo.phone;
    }
    if (!doc.contactInfo.showEmail) {
      delete doc.contactInfo.email;
    }
  }
  return doc;
};

// Seed sample starter items when database is empty
const seedStarterLostFoundItems = async (userId) => {
  const count = await LostFoundItem.countDocuments();
  if (count > 0) return;

  const starterItems = [
    {
      type: 'FOUND',
      title: 'Brown leather wallet',
      description: 'Found this wallet on the desk in front of the mini market. Contains some cards and campus ID.',
      category: 'Wallets & Bags',
      location: 'Student Center / Mini Market',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      contactInfo: {
        name: 'Campus Security',
        phone: '+91 98765 43210',
        email: 'security@campus.edu',
        showPhone: true,
        showEmail: true,
      },
      user: userId,
    },
    {
      type: 'FOUND',
      title: 'Black Casio G-Shock Watch',
      description: 'Black digital sports watch found in the gym locker room near bench 4.',
      category: 'Watches & Jewelry',
      location: 'Sports Complex / Gym Locker Room',
      date: new Date(Date.now() - 48 * 60 * 60 * 1000),
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      contactInfo: {
        name: 'Gym Desk Attendant',
        email: 'sportsdesk@campus.edu',
        showPhone: false,
        showEmail: true,
      },
      user: userId,
    },
    {
      type: 'LOST',
      title: 'Blue ADA Spiral Notebook',
      description: 'Blue covered notebook with Analysis & Design of Algorithms lecture notes and assignment 2.',
      category: 'Books & Notes',
      location: 'Library 2nd Floor Study Cubicle',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      contactInfo: {
        name: 'Dharmi Patel',
        email: 'dharmi.patel@campus.edu',
        showPhone: false,
        showEmail: true,
      },
      user: userId,
    },
    {
      type: 'FOUND',
      title: 'White AirPods Pro Case',
      description: 'White wireless charging case found under seat C-12 in Main Auditorium after morning symposium.',
      category: 'Electronics',
      location: 'Main Auditorium, Row C',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'OPEN',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
      contactInfo: {
        name: 'Auditorium Staff',
        email: 'events@campus.edu',
        showPhone: false,
        showEmail: true,
      },
      user: userId,
    },
  ];

  try {
    await LostFoundItem.insertMany(starterItems);
  } catch (err) {
    // ignore
  }
};

/**
 * @desc    Create a new lost or found item
 * @route   POST /api/v1/lost-found
 * @access  Private
 */
const createLostFoundItem = asyncHandler(async (req, res) => {
  const {
    type,
    title,
    description,
    category,
    location,
    date,
    status,
    imageUrl,
    contactInfo = {},
  } = req.body;

  const item = await LostFoundItem.create({
    type: type.toUpperCase(),
    title: title.trim(),
    description: description.trim(),
    category: category || 'Other',
    location: location.trim(),
    date: date ? new Date(date) : new Date(),
    status: status ? status.toUpperCase() : 'OPEN',
    imageUrl: imageUrl || '',
    contactInfo: {
      name: contactInfo.name || req.user.name || '',
      phone: contactInfo.phone || '',
      email: contactInfo.email || req.user.email || '',
      showPhone: Boolean(contactInfo.showPhone),
      showEmail: contactInfo.showEmail !== undefined ? Boolean(contactInfo.showEmail) : true,
    },
    user: req.user._id,
  });

  return ApiResponse.created(res, 'Lost & Found item reported successfully', item);
});

/**
 * @desc    Get all lost and found items with search, filter, and pagination
 * @route   GET /api/v1/lost-found
 * @access  Public / Protected
 */
const getLostFoundItems = asyncHandler(async (req, res) => {
  const currentUserId = req.user ? req.user._id : null;
  const currentUserRole = req.user ? req.user.role : null;

  // Auto-seed if empty
  if (currentUserId) {
    await seedStarterLostFoundItems(currentUserId);
  }

  const { type, category, status, search, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (type) {
    filter.type = type.toUpperCase();
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (status) {
    filter.status = status.toUpperCase();
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { location: { $regex: s, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const total = await LostFoundItem.countDocuments(filter);
  const items = await LostFoundItem.find(filter)
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const sanitizedItems = items.map((item) =>
    applyPrivacyFilter(item, currentUserId, currentUserRole)
  );

  return ApiResponse.success(res, 'Lost & Found items retrieved successfully', {
    items: sanitizedItems,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      hasMore: skip + items.length < total,
    },
  });
});

/**
 * @desc    Get single lost & found item by ID
 * @route   GET /api/v1/lost-found/:id
 * @access  Public / Protected
 */
const getLostFoundItemById = asyncHandler(async (req, res) => {
  const currentUserId = req.user ? req.user._id : null;
  const currentUserRole = req.user ? req.user.role : null;

  const item = await LostFoundItem.findById(req.params.id).populate(
    'user',
    'name email avatar role department branch'
  );

  if (!item) {
    return ApiResponse.notFound(res, 'Lost & Found item not found');
  }

  const sanitized = applyPrivacyFilter(item, currentUserId, currentUserRole);
  return ApiResponse.success(res, 'Item retrieved successfully', sanitized);
});

/**
 * @desc    Update lost & found item (Owner only)
 * @route   PUT /api/v1/lost-found/:id
 * @access  Private
 */
const updateLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findById(req.params.id);

  if (!item) {
    return ApiResponse.notFound(res, 'Lost & Found item not found');
  }

  const isOwner = item.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return ApiResponse.forbidden(res, 'You are not authorized to update this item');
  }

  const updateFields = { ...req.body };
  if (updateFields.status) {
    updateFields.status = updateFields.status.toUpperCase();
  }
  if (updateFields.type) {
    updateFields.type = updateFields.type.toUpperCase();
  }

  const updatedItem = await LostFoundItem.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  }).populate('user', 'name email avatar role');

  return ApiResponse.success(res, 'Item updated successfully', updatedItem);
});

/**
 * @desc    Delete lost & found item (Owner only)
 * @route   DELETE /api/v1/lost-found/:id
 * @access  Private
 */
const deleteLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findById(req.params.id);

  if (!item) {
    return ApiResponse.notFound(res, 'Lost & Found item not found');
  }

  const isOwner = item.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return ApiResponse.forbidden(res, 'You are not authorized to delete this item');
  }

  await LostFoundItem.findByIdAndDelete(req.params.id);

  return ApiResponse.success(res, 'Item deleted successfully', null);
});

module.exports = {
  createLostFoundItem,
  getLostFoundItems,
  getLostFoundItemById,
  updateLostFoundItem,
  deleteLostFoundItem,
};
