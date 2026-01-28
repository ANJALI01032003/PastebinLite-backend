const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");
  } catch (err) {
    console.error(err);
  }
};

module.exports = { sequelize, connectDB };
