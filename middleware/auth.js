export function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

export function ensureGuest(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/discover');
  } else {
    return next();
  }
}

// Middleware to check if the user has completed onboarding
export function checkOnboarding(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.onboardingComplete) {
            // If onboarding is complete, let them proceed to their destination
            return next();
        } else {
            // If not complete, and they are not already on an onboarding route, redirect them.
            if (!req.path.startsWith('/onboarding')) {
                 res.redirect('/onboarding/step1');
            } else {
                 return next();
            }
        }
    } else {
        // If not authenticated, let other middleware handle it (e.g., ensureAuth)
        return next();
    }
}