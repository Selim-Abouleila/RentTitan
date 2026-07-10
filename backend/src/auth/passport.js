const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');

dotenv.config();

const prisma = require('../prisma');

// Configures Passport to use the Google OAuth 2.0 strategy. 
// It intercepts the Google profile data, looks up the user in the PostgreSQL database, and creates a new user if they don't exist.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER_CLIENT_SECRET',
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const name = profile.displayName;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
        const googleId = profile.id;
        
        let user = await prisma.user.findUnique({ where: { googleId } });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId,
              email,
              name,
              avatar,
            }
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
