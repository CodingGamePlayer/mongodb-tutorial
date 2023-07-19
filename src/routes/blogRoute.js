const { Router } = require("express");
const blogRouter = Router();
const { isValidObjectId } = require("mongoose");
const commentRouter = require("./commentRoute");
const Blog = require("../models/Blog");
const User = require("../models/User");
const { Comment } = require("../models/Comment");

blogRouter.use("/:blogId/comment", commentRouter);

blogRouter.post("/", async (req, res) => {
   try {
      const { title, content, islive, userId } = req.body;
      if (typeof title !== "string") return res.status(400).send({ error: "title is required" });
      if (typeof content !== "string") return res.status(400).send({ error: "content is required" });
      if (islive && typeof islive !== "boolean") return res.status(400).send({ error: " islive must be boolean" });
      if (!isValidObjectId(userId)) return res.status(404).send({ error: "userId is not valid" });

      let user = await User.findById(userId);
      if (!user) res.status(404).send({ error: "user not found" });

      let blog = new Blog({ ...req.body, user });
      blog = await blog.save();
      return res.status(201).json({ blog });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
   }
});

blogRouter.get("/", async (req, res) => {
   try {
      let { page } = req.query;
      page = parseInt(page);
      const blogs = await Blog.find({})
         .sort({ updatedAt: -1 })
         .skip(page * 3)
         .limit(3);
      //  .populate([{ path: "user" }, { path: "comments", popoulate: { path: "user" } }]);
      return res.status(200).send({ blogs });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
   }
});

blogRouter.get("/:blogId", async (req, res) => {
   try {
      const { blogId } = req.params;
      if (!isValidObjectId(blogId)) res.status(404).send({ error: "blogId is not valid" });

      const blog = await Blog.findOne({ _id: blogId });
      const commentCount = await Comment.find({ blog: blogId }).countDocuments();
      return res.status(200).send({ blog, commentCount });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
   }
});

blogRouter.put("/:blogId", async (req, res) => {
   try {
      const { blogId } = req.params;
      if (!isValidObjectId(blogId)) return res.status(404).send({ error: "blogId is not valid" });

      const { title, content } = req.body;
      if (typeof title !== "string") return res.status(400).send({ error: "title is required" });
      if (typeof content !== "string") return res.status(400).send({ error: "content is required" });

      const blog = await Blog.findOneAndUpdate({ _id: blogId }, { title, content }, { new: true });
      return res.status(200).send({ blog });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
   }
});

blogRouter.patch("/:blogId/live", async (req, res) => {
   try {
      const { blogId } = req.params;
      if (!isValidObjectId(blogId)) return res.status(404).send({ error: "blogId is not valid" });

      const { islive } = req.body;
      if (typeof islive !== "boolean") return res.status(400).send({ error: "islive must be boolean" });

      const blog = await Blog.findByIdAndUpdate(blogId, { islive }, { new: true });
      return res.status(200).send({ blog });
   } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
   }
});

module.exports = blogRouter;
