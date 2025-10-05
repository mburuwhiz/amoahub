export function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  // Optional: Add a flash message for unauthorized access
  res.redirect('/');
}