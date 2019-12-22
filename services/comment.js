const passport = require("passport");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = (app, db) => {
  app.post(
    "/create-comment/:post_id",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      // Lab 1
      db.comment
        .create({
          message: req.body.message,
          post_id: req.params.post_id,
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
    "/update-comment/:id",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 2
      try {
        let result = await db.comment.update(
          {
            message: req.body.message
          },
          { where: { user_id: req.user.id, id: req.params.id } }
        );
        res.status(201).send(result);
      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    }
  );

  app.delete(
    "/delete-comment/:id",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 3
      try {
        let result = await db.comment.destroy({
          where: { user_id: req.user.id, id: req.params.id }
        });
        res.status(200).send("delete comment success");
      } catch (err) {
        res.status(400).send({ message: err.message });
      }
    }
  );
};
