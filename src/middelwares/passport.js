import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userModel } from "../models/index.js";
import { createHash, isValidPassword } from "../utils/crypt.js";

passport.use(
  "register",
  new LocalStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      try {
        const user = await userModel.getByUsername(username);
        if (user) {
          return done(null, false, {
            message: "El nombre de usuario ya existe"
          });
        }
        const newUser = {
          username,
          password: createHash(password)
        };
        const newUserAdded = await userModel.save(newUser);
        console.log(`Usuario registrado con éxito con id ${newUserAdded.id}`);
        return done(null, newUserAdded);
      } catch (error) {
        console.log("Error al registrar usuario: ", error);
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await userModel.getByUsername(username);
      if (!user) {
        return done(null, false, {
          message: "Nombre de usuario y/o contraseña incorrectos"
        });
      }
      if (!isValidPassword(user, password)) {
        return done(null, false, {
          message: "Nombre de usuario y/o contraseña incorrectos"
        });
      }
      return done(null, user);
    } catch (error) {
      console.log("Error al loguear usuario: ", error);
      done(error);
    }
  })
);

// >>>> Solo para local strategy
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await userModel.getById(id);
//     done(null, user);
//   } catch (error) {
//     done(error);
//   }
// });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://des13-dual-prellezose.herokuapp.com/auth/google/callback"
      //callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, userProfile, done) => {
      return done(null, userProfile);
    }
  )
);

// >>>> Combinando ambas opciones de serialización
passport.serializeUser((user, done) => {
  if (user.provider) {
    done(null, user);
  } else {
    done(null, user.id);
  }
});

passport.deserializeUser(async (data, done) => {
  if (data.provider) {
    done(null, data);
  } else {
    try {
      const id = data;
      const user = await userModel.getById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
});

export { passport };
