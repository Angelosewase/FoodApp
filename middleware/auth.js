const config = require("config");
const jwt = require("jsonwebtoken");

const tokenConfig = config.get("server.tokens");

const isAuth =
  (shouldThrow = true) =>
  async (req, res, next) => {
    const header = req.headers.authorization;
    const accessToken = header;

    console.log(header);

    if (!accessToken) {
      return res.status(400).json({ error: "Auth token must be provided" });
    }

    const token = jwt.verify(accessToken, tokenConfig.TokenSecret);

    if (!token && shouldThrow) {
      return res.status(400).json({ error: "Not authenticated" });
    }

    req.userId = token.userId;

    next();
  };

module.exports = { isAuth };
