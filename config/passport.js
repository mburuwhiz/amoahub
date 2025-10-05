import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import User from '../models/User.js';

export default function (passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // If user registered with Google, they won't have a password.
        if (user.googleId && !user.password) {
            return done(null, false, { message: 'This account was registered with Google. Please log in with Google.' });
        }

        // Match password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Password incorrect' });
        }

        // Check if the user is verified (only for non-Google users)
        if (user.password && !user.isVerified) {
            return done(null, false, { message: 'Please verify your email address before logging in.' });
        }

        return done(null, user);
      } catch (err) {
        console.error(err);
        return done(err);
      }
    })
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          // We will ask for displayName in the next step
          displayName: '',
          email: profile.emails[0].value,
          profileImage: profile.photos[0].value.replace('s96-c', 's250-c'), // Get higher res image
          isVerified: false, // All users must be manually verified by an admin
          onboardingComplete: false, // New users must go through onboarding
        };

        try {
          // Find user by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // If no user with googleId, check if one exists with the same email
          user = await User.findOne({ email: newUser.email });
          if (user) {
            // Link the Google account to the existing local account
            user.googleId = newUser.googleId;
            user.profileImage = user.profileImage || newUser.profileImage; // Update image if they don't have one
            await user.save();
            return done(null, user);
          }

          // If no user exists at all, create a new one
          user = await User.create(newUser);
          done(null, user);

        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );


  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}