const { Router } = require("express");
const commentRouter = Router({ mergeParams: true });
const { isValidObjectId } = require("mongoose");
const { Comment } = require("../models/Comment");
const Blog = require("../models/Blog");
const User = require("../models/User");

commentRouter.post("/", async (req, res) => {
   try {
      const { blogId } = req.params;
      const { content, userId } = req.body;

      if (!isValidObjectId(blogId)) {
         return res.status(400).send({ error: "Invalid blogId" });
      }

      if (!isValidObjectId(userId)) {
         return res.status(400).send({ error: "Invalid userId" });
      }

      if (typeof content !== "string") {
         return res.status(400).send({ error: "content is required" });
      }
      const [blog, user] = await Promise.all([Blog.findById(blogId), User.findById(userId)]);

      if (!blog || !user) {
         return res.status(400).send({ error: "Blog or user not found" });
      } else if (!blog.islive) {
         return res.status(400).send({ error: "Blog not live" });
      }

      const comment = new Comment({
         content,
         user,
         userFullName: `${user.name.first} ${user.name.last}`,
         blog: blogId,
      });
      //   await Promise.all([comment.save(), Blog.updateOne({ _id: blogId }, { $push: { comments: comment } })]);

      blog.commentCount++;
      blog.comments.push(comment);

      if (blog.commentCount > 3) blog.comments.shift();

      await Promise.all([
         comment.save(), //
         blog.save(), //
         //  Blog.updateOne({ _id: blogId }, { $inc: { commentCount: 1 } }),
      ]);

      return res.status(201).send({ comment });
   } catch (error) {
      return res.status(400).send({ error: error.message });
   }
});

commentRouter.get("/", async (req, res) => {
   let { page } = req.query;
   page = parseInt(page);
   try {
      const { blogId } = req.params;
      if (!isValidObjectId(blogId)) {
         return res.status(400).send({ error: "Invalid blogId" });
      }

      const comments = await Comment.find({ blog: blogId })
         .sort({ createdAt: -1 })
         .skip(page * 3)
         .limit(page);
      return res.status(200).send({ comments });
   } catch (error) {}
});

commentRouter.patch("/:commentId", async (req, res) => {
   try {
      const { commentId } = req.params;
      const { content } = req.body;
      if (typeof content !== "string") {
         return res.status(400).send({ error: "content is required" });
      }

      const [comment] = await Promise.all([
         Comment.findOneAndUpdate({ _id: commentId }, { $set: { content } }, { new: true }),
         Blog.updateOne({ "comments._id": commentId }, { "comments.$.content": content }),
      ]);
      return res.status(200).send({ comment });
   } catch (error) {
      console.log(error);
      return res.status(400).send({ error: error.message });
   }
});

commentRouter.delete("/:commentId", async (req, res) => {
   try {
      const { commentId } = req.params;
      const comment = await Comment.findOneAndDelete({ _id: commentId });

      if (comment === null) {
         return res.status(404).send({ error: "Comment not found" });
      }

      await Blog.updateOne({ "comments._id": commentId }, { $pull: { comments: { _id: commentId } } });

      return res.status(200).send({ comment });
   } catch (error) {
      console.log(error);
      return res.status(400).send({ error: error.message });
   }
});
module.exports = commentRouter;
