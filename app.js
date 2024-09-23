const { createConnection } = require("mysql2/promise");
const config = require("#root/config");
const Core = require("#root/lib/core");
const express = require("express");
const session = require("express-session");

const usersRouter = require("#routes/users");
const servicesRouter = require("#routes/services");

/**
 * 
 * @param {Core} core 
 */
async function generateAdmin(core) {
  const { name, lastName, email, companyName, password } = config.admin;
  const user = await core.tryCreateUser(name, lastName, email, companyName, password, true);
  if (user && typeof user === "object") {
    console.log(`
------------------------------------------
Admin account created
Email: ${email}
Password: ${password}
------------------------------------------`);
  } else {
    console.log(user);
  }
}

async function run() {
  const conn = await createConnection(config.mysql);

  const core = new Core(conn, config);
  await core.prepareDatabase();

  if (config.admin.createAdmin) {
    // Admin is automatically created if If no admin use is present
    if (config.admin.onlyIfDoesntExist) {
      const adminCount = await core.getAdminCount();
      if (adminCount == 0) await generateAdmin(core);
    } else {
      await generateAdmin(core);
    }
  }

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(session({
    // genid: genuuid, // method for generating session IDs, if not package uid-safe is used as default
    secret: "session secret key",
    resave: false,
    saveUninitialized: false, // Disables generating Session ID if user is not logged in
    cookie: {
      secure: config.api.https,
      maxAge: 3600000 // Session life time in ms
    }
  }));
  
  app.request.core = core;
  
  app.use((req, res, next) => {
    core.logRequest(req.ip, req.method, req.url);
    next();
  });
  
  app.use("/api/users", usersRouter);
  app.use("/api/services", servicesRouter);


  app.use("/api/*", (req, res) => {
    res.status(400).send("Bad Request");
  });


  app.listen(
    config.api.port,
    config.api.address,
    () => console.log(`Listening on http${config.api.https ? "s" : ""}://${config.api.address}:${config.api.port}`)
  );
}

run();