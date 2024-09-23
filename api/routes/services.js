const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("#root/api/middleware");

// Create Service
router.post("", isLoggedIn, async (req, res) => {
  const { name } = req.body;
  if (!name || name.length > req.core.cfg.varChar.companyNameMaxLength) return res.status(404).send(`name is required and needs to be of max length ${req.core.cfg.varChar.companyNameMaxLength}`);

  const user = await req.core.getUser(req.session.user.userId);
  if (user) {
    const service = await user.createService(name);
    res.status(201).send(service);
  } else {
    res.status(404).send("Unable to create new service, no user found");
  }
});

// Get Service
router.get("/:serviceId", isLoggedIn, async (req, res) => {
  const { serviceId } = req.params;
  const service = await req.core.getUserService(req.session.user.userId, serviceId);
  if (service) {
    res.status(200).send(service);
  } else {
    res.status(404).send("Specified service was not found");
  }
});

// Delete Service
router.delete("/:serviceId", isLoggedIn, async (req, res) => {
  const { serviceId } = req.params;
  const service = await req.core.getUserService(req.session.user.userId, serviceId);
  if (service) {
    const isDeleted = service.delete();
    if (isDeleted) {
      res.status(200).send("Specified service was deleted");
    } else {
      res.status(404).send("Unable to delete, specified service was not found");
    }
  } else {
    res.status(404).send("Specified service was not found");
  }
});

module.exports = router;