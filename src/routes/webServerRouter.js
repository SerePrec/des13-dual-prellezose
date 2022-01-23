import { Router } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { isAuthWeb } from "../middelwares/auth.js";
import { validateRegisterPost } from "../middelwares/validateWebData.js";
import { passport } from "../middelwares/passport.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

router.get("/", isAuthWeb, (req, res) => {
  const { messages } = req.session;
  let message;
  if (messages) {
    req.session.messages = [];
    message = messages[messages.length - 1];
  }
  const { user } = req;
  res.render("./pages/home", {
    title: "Carga de productos y Chat",
    username: user.provider ? user.displayName : user.username,
    email: user.provider ? user.emails[0].value : user.username,
    firstName: user.provider ? user.name?.givenName : "",
    lastName: user.provider ? user.name?.familyName : "",
    avatar: user.provider ? user.photos[0].value : "",
    successRegister: message
  });
});

router.get("/productos-mock", isAuthWeb, (req, res) => {
  res.sendFile("productos-mock.html", {
    root: path.join(__dirname, "..", "views")
  });
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.sendFile("login.html", {
    root: path.join(__dirname, "..", "views")
  });
});

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/login-error",
    // connect-flash presenta más problemas de carrera al guardar sesiones en MongoDB y no en la memoria. Por eso se hace proceso manual de pasaje de mensajes
    failureMessage: true,
    successRedirect: "/"
  })
);

router.get("/login-error", (req, res) => {
  const { messages } = req.session;
  let message;
  if (messages) {
    req.session.messages = [];
    message = messages[messages.length - 1];
  }
  res.render("pages/loginError", {
    title: "Error de login",
    error: message
  });
});

router.get("/register", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/");
  res.sendFile("register.html", {
    root: path.join(__dirname, "..", "views")
  });
});

router.post(
  "/register",
  validateRegisterPost,
  passport.authenticate("register", {
    failureRedirect: "/register-error",
    // connect-flash presenta más problemas de carrera al guardar sesiones en MongoDB y no en la memoria. Por eso se hace proceso manual de pasaje de mensajes
    failureMessage: true,
    successRedirect: "/",
    successMessage: "¡Gracias por registrarte en nuestro sitio!"
  })
);

router.get("/register-error", (req, res) => {
  const { messages } = req.session;
  let message;
  if (messages) {
    req.session.messages = [];
    message = messages[messages.length - 1];
  }
  res.render("pages/registerError", {
    title: "Error de registro",
    error: message
  });
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login-error"
  })
);

router.get("/logout", (req, res) => {
  if (req.isAuthenticated()) {
    const { provider, username, displayName } = req.user;
    req.logout();
    req.session.destroy(err => {
      if (!err) {
        res.clearCookie("connect.sid");
        return res.render("./pages/logout", {
          title: "Logout",
          username: provider ? displayName : username
        });
      }
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

export default router;
