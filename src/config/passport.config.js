const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User.model');
const logger = require('../utils/logger');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      
      if (!user) {
        return done(null, false);
      }

      if (user.changedPasswordAfter(jwtPayload.iat)) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      logger.error(`Passport JWT error: ${error}`);
      return done(error, false);
    }
  })
);

module.exports = passport;