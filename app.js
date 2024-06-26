require("dotenv").config();

const express = require("express");

const mysql = require("mysql");

const app = express();

const PORT = process.env.PORT || 2000;

app.use(express.static("public"));

app.use(express.json());



const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect(function (error) {
  if (error) {
    console.log("conncetion failed: " + error);
  }
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/Project2/public/index.html");
});

// app.post("/api/create-short-url", function (request, response) {
//   let longurl = request.body.longurl;

//   let uniqueID = Math.random()
//     .toString(36)
//     .replace(/[^a-z0-9]/gi, "")
//     .substring(2, 10);

//   // Check if the long URL already exists in the database

//   let sql = `SELECT * FROM links WHERE longurl='${longurl}'`;

//   connection.query(sql, function (error, result) {
//     if (error) {
//       response.status(500).json({
//         status: "Failed",
//         message: "Some error occurred during selecting url",
//       });
//     } else if (result.length > 0) {
//       response.status(200).json({
//         status: "Success",
//         shorturlid: result[0].shorturlid,
//       });
//     } else {
//       // If the long URL doesn't exist, insert a new row

//       let sql = `INSERT INTO links(longurl,shorturlid) VALUES('${longurl}', '${uniqueID}')`;

//       connection.query(sql, function (error, result) {
//         if (error) {
//           response.status(500).json({
//             status: "Failed",
//             message: "Some error occurred while creating short url",
//           });
//         } else {
//           // Sending a JSON response with the short URL ID upon successful creation

//           response
//             .status(200)
//             .json({ status: "success", shorturlid: uniqueID });
//         }
//       });
//     }
//   });
// });


app.post("/api/create-short-url", function (request, response) {
  let longurl = request.body.longurl;
  let uniqueID = Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/gi, "")
    .substring(2, 10);

  // Check if the long URL already exists in the database
  let selectSql = `SELECT * FROM links WHERE longurl = '${longurl}'`;
  connection.query(selectSql, function (error, result) {
    if (error) {
      response.status(500).json({
        status: "Failed",
        message: "Some error occurred while checking long URL",
      });
    } else if (result.length > 0) {
      // If the long URL already exists, return the existing short URL ID
      response.status(200).json({
        status: "success",
        shorturlid: result[0].shorturlid,
        
      });
    } else {
      // If the long URL doesn't exist, insert a new row
      let insertSql = `INSERT INTO links(longurl, shorturlid) VALUES('${longurl}', '${uniqueID}')`;
      connection.query(insertSql, function (error, result) {
        if (error) {
          response.status(500).json({
            status: "Failed",
            message: "Some error occurred while creating short url",
          });
        } else {
          response.status(200).json({ status: "success", shorturlid: uniqueID });
        }
      });
    }
  });
});


app.get("/api/get-all-short-urls", function (request, response) {
  let sql = "SELECT * FROM links";

  connection.query(sql, function (error, result) {
    if (error) {
      response.status(500).json({
        status: "Failed",
      });
    } else {
      // Sending a JSON response with the retrieved short URLs upon success

      response.status(200).json(result);
    }
  });
});

// Route handler for redirecting to the long URL associated with a short URL ID

app.get("/:shorturlid", function (request, response) {
  let shorturlid = request.params.shorturlid;
  let sql = `SELECT * FROM links WHERE shorturlid = '${shorturlid}' LIMIT 1 `;

  connection.query(sql, function (error, result) {
    if (error) {
      response.status(500).json({
        status: "Failed",
        message: "Some error occurred while fetching redirect link",
      });
    } else if (result.length === 0) {
      response.status(404).json({
        status: "Failed",
        message: "Short URL not found",
      });
    } else {
      sql = `UPDATE links SET count = ${result[0].count + 1} WHERE id='${
        result[0].id
      }' LIMIT 1`;

      connection.query(sql, function (error, result2) {
        if (error) {
          response.status(500).json({
            status: "Failed",
            message: "Some error occurred while updating count",
          });
        } else {
          response.redirect(result[0].longurl);
        }
      });
    }
  });
});



app.listen(PORT, function () {
  console.log("Server is running on port 2000");
});

