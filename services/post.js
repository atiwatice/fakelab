const passport = require("passport");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = (app, db) => {
  app.post(
    "/create-post",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      // Lab 1
      db.post
        .create({
          message: req.body.message,
          image_url: req.body.image_url,
          user_id: req.user.id
        })
        .then(result => {
          res.status(201).send(result);
        })
        .catch(err => {
          res.status(400).send({ message: err.message });
        });
    }
  );

  app.put(
    "/update-post/:id",
    passport.authenticate("jwt", { session: false }),
    async function async(req, res) {
      // Lab 2
      try {
        let result = await db.post.update(
          {
            message: req.body.message
          },
          { where: { id: req.params.id, user_id: req.user.id } }
        );
        res.status(201).send(result);
      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    }
  );

  app.delete(
    "/delete-post/:id",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      try {
        let result = await db.post.destroy({
          where: { id: req.params.id, user_id: req.user.id }
        });
        res.status(200).send("delete success");
      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    }
  );

  app.get(
    "/my-posts",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      // Lab 4
      db.post
        .findAll({
          where: { user_id: req.user.id }
        })
        .then(result => {
          res.status(201).send(result);
        })
        .catch(err => {
          res.status(400).send({ message: err.message });
        });
    }
  );

  app.get(
    "/feed",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 5
      let allFriend = await db.friend
        .findAll({
          where: { request_to_id: req.user.id, status: "friend" },
          attributes: ["request_from_id"],
          distinct: true
        })
        .catch(() => {
          res.status(400).send({ message: err.message });
        });

      let friendArray = await allFriend.map(id => id.request_from_id);
          friendArray.push(req.user.id)
      let allPost = await db.user
        .findAll({
          where: { id: { [Op.in]: friendArray } },
          include: [{ model: db.post, include: [{ model: db.comment }] }]
        })
        .catch(err => {
          res.status(400).send({ message: err.message });
        });

      res.status(200).send(allPost);
    }
  );
};
