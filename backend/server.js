import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.get("/api/config/paypal", (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);


app.post("/likes/add", (req, res) => {
  const { userId, productId } = req.body; // Extract userId and productId from the request body

  if (!userId || !productId) {
    return res.status(400).json({ error: "userId and productId are required" });
  }

  const like = {
    userId,
    productId,
    // You can add more fields to the 'like' object if needed
  };

  db.collection("likes")
    .insertOne(like)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not create new document" });
    });
});

app.delete("/likes/delete/:id", (req, res) => {
  console.log(req.params.id);
  if (ObjectId.isValid(req.params.id)) {
    db.collection("likes")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not delete document" });
      });
  } else {
    res.status(500).json({ error: "Could not delete document" });
  }
});

app.get("/likes/:userId/:productId", (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.productId;

  db.collection("likes").findOne(
    { userId: userId, productId: productId },
    (err, like) => {
      if (err) {
        res.status(500).json({ error: "Error finding liked item" });
      } else {
        if (like) {
          res.status(200).json(like);
        } else {
          res.status(404).json({ error: "Liked item not found" });
        }
      }
    }
  );
});

app.get("/likes/:userId", (req, res) => {
  const userId = req.params.userId;

  db.collection("likes")
    .find({ userId })
    .toArray()
    .then((likes) => {
      res.status(200).json(likes);
    })
    .catch((err) => {
      res.status(500).json({ error: "Error fetching liked products" });
    });
});



const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is Runn....");
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//runingin
