const User = require('../models/User');

// a simple protection middleware that expects a user id header
// in a real app you'd verify a JWT or session cookie.
exports.protect = async (req, res, next) => {
  try {
    const userId = req.header('x-user-id');
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized, missing user id' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
