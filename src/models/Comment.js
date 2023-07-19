const {
   Schema,
   model,
   Types: { ObjectId },
} = require("mongoose");

const CommentSchema = Schema(
   {
      content: {
         type: String,
         require: true,
      },
      userId: {
         type: ObjectId,
         ref: "user",
         require: true,
      },
      userFullName: {
         type: String,
         require: true,
      },
      blog: {
         type: ObjectId,
         ref: "blog",
         require: true,
      },
   },
   { timestamps: true }
);

CommentSchema.index({ blog: 1, createdAt: -1 });

const Comment = model("comment", CommentSchema);

module.exports = { Comment, CommentSchema };
