import passport from "passport";
import jwt from "passport-jwt";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { userModel } from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;
const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use(
        "register",
        new LocalStrategy(
            { passReqToCallback: true, usernameField: "email" },
            async (req, username, password, done) => {
                const { first_name, last_name, email, age } = req.body;

                try {
                    let user = await userModel.findOne({ email: username });

                    if (user) {
                        console.log("El usuario " + email + " ya se encuentra registrado!");
                        return done(null, false);
                    }

                    user = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password: createHash(password),
                    };

                    if (
                        user.email == "adminCoder@coder.com" &&
                        password === "adminCod3r123"
                    ) {
                        user.role = "admin";
                    } else {
                        user.role = "user";
                    }

                    let result = await userModel.create(user);
                    console.log("Usuario creado con éxito:", result);

                    if (result) {
                        return done(null, result);
                    }
                } catch (error) {
                    console.error("Error durante el proceso de registro:", error);
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "login",
        new LocalStrategy(
            { usernameField: "email", passwordField: "password" },
            async (username, password, done) => {
                console.log("[Auth] Trying to authenticate user:", username);

                try {
                    let user = await userModel.findOne({ email: username });

                    if (!user) {
                        return done(null, false, { message: "Usuario incorrecto." });
                    }
                    if (!isValidPassword(user, password)) {
                        return done(null, false, { message: "Contraseña incorrecta." });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use(
        "jwt",
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
                secretOrKey: "S3CR3T0",
            },
            async (jwt_payload, done) => {
                try {
                    const user = await userModel.findOne({ email: jwt_payload.email });
                    if (!user) {
                        return done(null, false, { message: "Usuario no encontrado." });
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
};

passport.use("github", new GitHubStrategy({
    clientID: "Iv1.ed9b73f3f35e8efb",
    clientSecret: "66ac3ebfb12921fdd8bdabcd9e6561cb80812778",
    callbackURL: "http://localhost:8080/api/sessions/githubcallback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log(profile);
        let user = await userModel.findOne({ email: profile._json.email });

        if (user) {
            return done(null, user);
        } else {
            let newUser = {
                first_name: profile._json.name,
                last_name: "",
                email: profile._json.email,
                age: 100,
                password: ""
            }

            let result = await userModel.create(newUser);

            return done(null, result);
        }
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    let user = await userModel.findById(id);
    done(null, user);
});
export default initializePassport;

const cookieExtractor = (req) => {
    let token = null;

    if (req && req.cookies) {
        token = req.cookies["coderCookieToken"];
    }

    return token;
};
