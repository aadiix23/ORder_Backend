const router = require("express").Router();
const {
    register,
    login,
    registerDeviceToken,
    removeDeviceToken
} = require("../controller/userController");
const {auth} = require("../middlewares/auth");

router.post("/register", register); 
router.post("/login", login);
router.post("/device-token", auth, registerDeviceToken);
router.delete("/device-token", auth, removeDeviceToken);

module.exports = router;
