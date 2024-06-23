const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

// bodyParser Configuration
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// EJS Configuration
app.set("view engine", "ejs");

// MongoDB Configuration
const { MongoClient, ObjectId } = require("mongodb");
const dbUrl = process.env.MONGO_KEY;

let mydb; // MongoDB variable global

// mongoose Configuration
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectMongoDB() {
  const client = new MongoClient(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    console.log("MongoDB connected!");
    mydb = client.db("bank-project");

    app.listen(8080, function () {
      console.log("8080 server ready...");
    });
  } catch (err) {
    console.log("err:", err);
  }
}

connectMongoDB();
const path = require("path");

/// 본격적인 url 연결입니다.

// Read : board Read 작업
app.get("/board", async (req, res) => {
  // DB
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await mydb
      .collection("realEstateForSale")
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const collection = mydb.collection("realEstateForSale");
    const total = await collection.countDocuments(); // 총 문서 개수

    if (!result) {
      res.status(404).send("Post");
    }

    res.render("board.ejs", {
      totalPages: Math.ceil(total / limit), // 총 페이지 수 계산
      currentPage: page, // 현재 페이지 번호
      data: result, // 페이지네이션된 데이터
      limit: limit, // 페이지 당 문서 수
    });
  } catch (err) {
    console.log("err:", err);
  }
});

// boardDetail Page Url
app.get("/board/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  mydb
    .collection("realEstateForSale")
    .findOne(query)
    .then((result) => {
      res.render("boardDetail.ejs", { data: result });
    });
});

// app.post("/", (req, res) => {
//   res.
// });

// CREATE: 매물 게시물 단건 저장
app.get("/post", (req, res) => {
  // ejs => render (SSR)
  res.render("post-real-estate-for-sale.ejs");
});

app.post("/save", (req, res) => {
  console.log(req.body);
  // mydb
  //   .collection("realEstateForSale")
  //   .insertOne({
  //     name: req.body.name,
  //     rent: req.body.rent,
  //     deposit: req.body.deposit,
  //     constructionYear: req.body.constructionYear,
  //     usage: req.body.usage,
  //     address: req.body.address,
  //     floor: req.body.floor,
  //     type: req.body.type,
  //     area: req.body.area,
  //   })
  //   .then((result) => {
  //     res.redirect("/board");
  //   })
  //   .catch((error) => {
  //     res.status(500).send();
  //   });
});

app.post("/delete", (req, res) => {
  // 요청에 맞는

  try {
    const query = { _id: new ObjectId(req.body._id) }; // ObjectId로 변환
    mydb
      .collection("realEstateForSale")
      .deleteOne(query)
      .then((result) => {
        console.log(query, "삭제완료!");
        // reload
        res.status(200).send();
      });
  } catch (error) {
    console.log(error);
  }
});

// UPDATE: 매물 게시물 단건 수정
app.post("/edit", (req, res) => {
  console.log("수정 전: ", req.body);
  const data = req.body;
  res.render("edit.ejs", { data });
});

app.post("/edit-complete", (req, res) => {
  console.log("수정 후: ", req.body);
  let objId = new ObjectId(req.body._id);
  console.log("req.body._id: ", req.body._id);

  mydb
    .collection("realEstateForSale")
    .updateOne(
      { _id: objId },
      {
        $set: {
          name: req.body.name,
          rent: req.body.rent,
          deposit: req.body.deposit,
          constructionYear: req.body.constructionYear,
          usage: req.body.usage,
          address: req.body.address,
          floor: req.body.floor,
          type: req.body.type,
          area: req.body.area,
        },
      }
    )
    .then((result) => {
      console.log("result: ", result);
      res.redirect("/board");
    })
    .catch((err) => {
      res.status(500).send();
    });
});
