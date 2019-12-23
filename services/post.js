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
      // try {
      //   let result = await db.post.update(
      //     {
      //       message: req.body.message
      //     },
      //     { where: { id: req.params.id, user_id: req.user.id } }
      //   );
      //   res.status(201).send(result);
      // } catch (err) {
      //   res.status(400).send({ message: err.message });
      // }

      let targetPost = await db.post.findOne({
        where: { id: req.params.id, user_id: req.user.id }
      });
      if (!targetPost) {
        res.status(404).send({ message: "post not found or Unauthorize" });
      } else {
        targetPost.update({
          message: req.body.message,
          image_url: req.body.image_url
        });
        res
          .status(200)
          .send({ message: `Post id: ${req.params.id} has been updated` });
      }
    }
  );

  app.delete(
    "/delete-post/:id",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // try {
      //   let result = await db.post.destroy({
      //     where: { id: req.params.id, user_id: req.user.id }
      //   });
      //   res.status(200).send({message:`Post id:${req.params.id} is deleted`});
      // } catch (err) {
      //   res.status(400).send({ message: err.message });
      // }
      let targetPost = await db.post.findOne({
        where: req.params.id,
        user_id: req.user.id
      });
      if (!targetPost) {
        res.status(404).send({
          message: `Post id ${req.params.id} not found or Unauthorized`
        });
      } else {
        targetPost.destroy();
        res
          .status(200)
          .send({ message: `Post id ${req.params.id} is deleted` });
      }
    }
  );

  app.get(
    "/my-posts",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      // Lab 4
      // db.post
      //   .findAll({
      //     where: { user_id: req.user.id }
      //   })
      //   .then(result => {
      //     res.status(201).send(result);
      //   })
      //   .catch(err => {
      //     res.status(400).send({ message: err.message });
      //   });

      db.post
        .findAll({
          where: { user_id: req.user.id },
          include: [
            { model: db.user, attributes: ["id", "name", "profile_img_url"] },
            {model:db.comment,
            imclude:[{model:db.user,attributes: ["id", "name", "profile_img_url"]}]
            }
          ]
        })
        .then(result => {
          res.status(200).send(result);
        })
        .catch(err => {
          console.log(err);
          res.status(400).send(err.message);
        });
    }
  );

  app.get(
    "/feed",
    passport.authenticate("jwt", { session: false }),
    async function(req, res) {
      // Lab 5
      // try {
      //   let allFriend = await db.friend.findAll({
      //     where: { request_to_id: req.user.id, status: "friend" },
      //     attributes: ["request_from_id"],
      //     distinct: true
      //   });
      //   let friendArray = await allFriend.map(id => id.request_from_id);
      //   friendArray.push(req.user.id);
      //   let allPost = await db.user.findAll({
      //     where: { id: { [Op.in]: friendArray } },
      //     include: [{ model: db.post, include: [{ model: db.comment }] },'createdAt', 'DESC']
      //   });

      //   res.status(200).send(allPost);
      // } catch (err) {
      //   res.status(400).send({ message: err.message });
      // }

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
      const allIds = requestFromIdsArray.concat(requestToIdsArray).concat([req.user.id])
      
      const allFeedPost = await db.post.findAll({
        where: {
          user_id: { [Op.in]: allIds }
        },
        include: [
          {
            model: db.user,
            attributes: ['id', 'name', 'profile_img_url']
          },
          {
            model: db.comment,
            include: [{ model: db.user, attributes: ['id', 'name', 'profile_img_url'] }]
          }
        ]
      })
      res.status(200).send(allFeedPost)


    }
  );
};
