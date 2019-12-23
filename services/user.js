//User.js
const jwt = require("jsonwebtoken");
const passport = require("passport");
const config = require("../config/passport/passport");
const bcrypt = require("bcryptjs");

const BCRYPT_SALT_ROUNDS = 12;
let jwtOptions = {};
jwtOptions.secretOrKey = "codecamp4";

module.exports = (app, db) => {
  app.post("/registerUser", (req, res, next) => {
    passport.authenticate("register", (err, user, info) => {
      if (err) {
        console.error(err);
      }
      if (info !== undefined) {
        console.error(info.message);
        res.status(403).send(info.message);
      } else {
        const data = {
          name: req.body.name,
          username: user.username,
          role: "user"
        };
        console.log(data);
        db.user
          .findOne({
            where: {
              username: req.body.username
            }
          })
          .then(user => {
            console.log(user);
            user
              .update({
                name: data.name,
                email: data.email,
                role: data.role
              })
              .then(() => {
                console.log("user created in db");
                res.status(200).send({ message: "user created" });
              });
          })
          .catch(err => {
            console.log(err);
          });
      }
    })(req, res, next);
  });

  
  app.post("/loginUser", (req, res, next) => {
    passport.authenticate("login", (err, users, info) => {
      if (err) {
        console.error(`error ${err}`);
      }
      if (info !== undefined) {
        console.error(info.message);
        if (info.message === "bad username") {
          res.status(401).send(info.message);
        } else {
          res.status(403).send(info.message);
        }
      } else {
        db.user
          .findOne({
            where: {
              username: req.body.username
            }
          })
          .then(user => {
            const token = jwt.sign(
              { id: user.id, role: user.role },
              config.jwtOptions.secretOrKey,
              {
                expiresIn: 18000
              }
            );
            res.status(200).send({
              auth: true,
              token,
              message: "user found & logged in"
            });
          });
      }
    })(req, res, next);
  });
  app.put(
    "/change-password",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 1
      try {
        var salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
        var hashedPassword = bcrypt.hashSync(req.body.password, salt);
        let result = await db.user.update(
          { password: hashedPassword },
          { where: { id: req.user.id } }
        );
        res.status(201).send(result);
      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    }
  );
  app.get(
    "/user/:id",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 2
      try {
        let allpost = await db.user.findAll({
          include: [{ model: db.post, include: [{ model: db.comment }] }],
          where:{id:req.params.id}
        });
        res.status(201).send(allpost);
      

      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    }
  );
};
