const express = require("express");
const User = require("../models/User");
const userRouter = express.Router();
const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const { Comment } = require("../models/Comment");

userRouter.get("/", async (req, res) => {
   try {
      const users = await User.find({});
      return res.send({ users });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
   }
});

userRouter.get("/:userId", async (req, res) => {
   try {
      const { userId } = req.params;
      if (!mongoose.isValidObjectId(userId)) {
         return res.status(400).send({ err: "userId is invalid" });
      }
      const user = await User.findById({ _id: userId });
      return res.send({ user });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error.message });
   }
});

userRouter.post("/", async (req, res) => {
   try {
      let { username, name } = req.body;

      if (!username) return res.status(400).send({ err: "username is required" });
      if (!name || !name.first || !name.last) return res.status(400).send({ err: "name is required" });

      const user = new User(req.body);
      await user.save();
      return res.send({ user });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error.message });
   }
});

userRouter.delete("/:userId", async (req, res) => {
   try {
      const { userId } = req.params;
      if (!mongoose.isValidObjectId(userId)) {
         return res.status(400).send({ err: "userId is invalid" });
      }
      const [user] = await Promise.all([
         User.findByIdAndDelete({ _id: userId }),
         Blog.deleteMany({ "user._id": userId }),
         Blog.updateMany({ "comments.user._id": userId }, { $pull: { comments: { user: userId } } }),
         Comment.deleteMany({ user: userId }),
      ]);
      return res.send({ user });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error.message });
   }
});

userRouter.put("/:userId", async (req, res) => {
   try {
      const { userId } = req.params;
      if (!mongoose.isValidObjectId(userId)) {
         return res.status(400).send({ err: "userId is invalid" });
      }

      const { age, name } = req.body;
      if (!age && !name) {
         return res.status(400).send({ err: "age or name are required" });
      } else if (typeof age !== "number") {
         return res.status(400).send({ err: "age must be a number" });
      } else if (typeof name.first !== "string" && typeof name.last !== "string") {
         return res.status(400).send({ err: "name must be a string" });
      }

      const user = await User.findByIdAndUpdate({ _id: userId }, { age, name }, { new: true });
      await Promise.all([Blog.updateMany({ "user._id": userId }, { "user.name": user.name })]);
      Blog.updateMany(
         {},
         { "comment.$[comment].userFullName": `${user.name.first} ${user.name.last}` },
         { arrayFilters: [{ "comment._id": userId }] }
      );

      return res.send({ user });
   } catch (error) {
      console.log(error);
      return res.status(500).send({ error: error.message });
   }
});

module.exports = userRouter;
