const express = require("express");
const app = express();
const userRouter = require("./routes/userRoute");
const blogRouter = require("./routes/blogRoute");
const mongoose = require("mongoose");

const { generateFakeData } = require("../faker2");

const server = async () => {
   try {
      const { MONGO_URI } = process.env;

      if (!MONGO_URI) throw new Error("MONGO_URI is required");

      await mongoose.connect(MONGO_URI, {});

      console.log("Mongodb connected");
      // mongoose.set("debug", true);

      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      app.use("/user", userRouter);
      app.use("/blog", blogRouter);

      app.listen(3000, async () => {
         console.log(`server listening on port 3000`);
         // for (let i = 0; i <= 20; i++) {
         // await generateFakeData(10, 2, 10);
         // }
      });
   } catch (error) {
      console.log(error);
   }
};

server();
