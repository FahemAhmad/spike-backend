const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.JWT_SECRET;
  return jwt({
    secret,
    algorithms: ["HS256"],
    getToken: fromHeaderOrQuerystring,
  }).unless({
    path: [
      { url: /\public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      "/api/v1/auth/login",
      "/api/v1/auth/signup",
    ],
  });
}

function fromHeaderOrQuerystring(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}
module.exports = authJwt;
