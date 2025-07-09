const express = require("express");
const router = express.Router();

// Controller imports
const userController = require("../controllers/admin/userController");
const skillController = require("../controllers/admin/skillController");
const monitorController = require("../controllers/admin/monitoringController");
const moderationController = require("../controllers/admin/moderationController");

// USER MANAGEMENT
router.get("/users", userController.getAllUsers);
router.put("/users/:id/role", userController.updateUserRole);
router.put("/users/:id/deactivate", userController.deactivateUser);

// SKILL MANAGEMENT
router.get("/skills", skillController.getAllSkills);
router.post("/skills/:id/validate", skillController.validateSkill);
router.post("/skills/import", skillController.importExternalSkills);

// SYSTEM MONITORING
router.get("/system/metrics", monitorController.getSystemMetrics);
router.get("/system/activity", monitorController.getUserActivityLog);
router.get("/system/reports/engagement", monitorController.generateEngagementReport);

// CONTENT MODERATION
router.post("/moderation/flag", moderationController.flagContent);
router.post("/moderation/ban/:id", moderationController.banUser);
router.get("/moderation/flagged", moderationController.getFlaggedContentList);

module.exports = router;
