module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define("comment", {
    message: {
      type: DataTypes.STRING(500)
    }
  });

  comment.associate = models => {
    comment.belongsTo(models.user, { foreignKey: "user_id" });
  };

  return comment;
};
