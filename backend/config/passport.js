const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ socialId: profile.id, authProvider: 'google' });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.socialId = profile.id;
      user.authProvider = 'google';
      await user.save();
      return done(null, user);
    }

    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      socialId: profile.id,
      authProvider: 'google',
      profile: {
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0].value
      }
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
  }));
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'picture']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ socialId: profile.id, authProvider: 'facebook' });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.socialId = profile.id;
      user.authProvider = 'facebook';
      await user.save();
      return done(null, user);
    }

    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      socialId: profile.id,
      authProvider: 'facebook',
      profile: {
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0].value
      }
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
  }));
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID) {
  passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
  callbackURL: "/api/auth/apple/callback"
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    let user = await User.findOne({ socialId: profile.id, authProvider: 'apple' });
    
    if (user) {
      return done(null, user);
    }

    user = await User.findOne({ email: profile.email });
    if (user) {
      user.socialId = profile.id;
      user.authProvider = 'apple';
      await user.save();
      return done(null, user);
    }

    user = new User({
      name: profile.name?.firstName + ' ' + profile.name?.lastName || 'Apple User',
      email: profile.email,
      socialId: profile.id,
      authProvider: 'apple'
    });

    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;