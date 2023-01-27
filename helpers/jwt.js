const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.JWT_SECRET;
  console.log("testing");
  return jwt({
    secret,
    algorithms: ["HS256"],
    getToken: fromHeaderOrQuerystring,
    isRevoked: isRevoked,
  }).unless({
    path: ["/api/v1/auth/login", "/api/v1/auth/signup"],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload) {
    done(payload, true);
  }
  done();
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
