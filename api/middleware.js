/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
function isLoggedIn(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).send(`Unauthorized, not logged in!`);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
function isAdmin(req, res, next) {
  if (req.session.user.isAdmin) {
    next();
  } else {
    res.status(403).send(`Unauthorized, not an admin`);
  }
}


module.exports = { isLoggedIn, isAdmin };