const passport = require("passport");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = (app, db) => {
  app.post(
    "/friend-request-to/:id",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      // Lab 1

      db.friend
        .create({
          request_from_id: req.user.id,
          request_to_id: req.params.id,
          status: "request"
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
    "/request-list",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 2
      // db.friend
      //   .findAll({ where: { status: "request", request_to_id: req.user.id } })
      //   .then(result => {
      //     res.status(201).send(result);
      //   })
      //   .catch(err => {
      //     res.status(400).send({ message: err.message });
      //   });

      const requestList = await db.friend.findAll({
        where: { request_to_id: req.user.id, status: "request" },
        attribute: [["request_from_id", "id"]]
      });

      const requestListIds = requestList.map(
        request => request.request_from_id
      );
      const requestuser = await db.user.findAll({
        where: { id: { [Op.in]: requestListIds } },
        attribute: ["id", "name", "profile_img_url"]
      });
      res.send(requestuser);
    }
  );

  app.put(
    "/accept-friend-request/:id",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 3
      db.friend
        .update(
          { status: "friend" },
          {
            where: {
              request_to_id: req.user.id,
              request_from_id: req.params.id,
              status: "request"
            }
          }
        )
        .then(result => {
          res.status(201).send(result);
        })
        .catch(err => {
          res.status(400).send({ message: err.message });
        });
    }
  );

  app.delete(
    "/deny-friend-request/:id",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      // Lab 4
      db.friend
        .destroy({
          where: {
            request_to_id: req.user.id,
            request_from_id: req.params.id,
            status: "request"
          }
        })
        .then(result => {
          res.status(200).send("delete success");
        })
        .catch(err => {
          res.status(400).send({ message: err.message });
        });
    }
  );

  app.delete(
    "/delete-friend/:id",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      // Lab 5
      db.friend
        .destroy({
          where: {
            request_to_id: req.user.id,
            request_from_id: req.params.id,
            status: "friend"
          }
        })
        .then(result => {
          res.status(200).send("delete success");
        })
        .catch(err => {
          res.status(400).send({ message: err.message });
        });
    }
  );

  app.get(
    "/friends-list",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 6
      // db.friend
      //   .findAll({
      //     where: { request_to_id: req.user.id, status: "friend" }
      //   })
      //   .then(result => {
      //     res.status(201).send(result);
      //   })
      //   .catch(err => {
      //     res.status(400).send({ message: err.message });
      //   });
      const requestFromIds = await db.friend.findAll({
        where: { status: "friend", request_to_id: req.user.id },
        attributes: [["request_from_id", "id"]]
      });
      const requestToIds = await db.friend.findAll({
        where: { status: "friend", request_from_id: req.user.id },
        attributes: [["request_to_id", "id"]]
      });

      const requestFromIdsArray = requestFromIds.map(request => request.id);
      const requestToIdsArray = requestToIds.map(request => request.id);
      const friendUser = await db.user.findAll({
        where: {
          id: { [Op.in]: requestFromIdsArray.concat(requestToIdsArray) }
        },
        attributes: ["id", "name", "profile_img_url"]
      });
      res.status(200).send(friendUser);
    }
  );
};
