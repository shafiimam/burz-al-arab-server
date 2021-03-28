const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const MongoClient = require("mongodb").MongoClient;
var serviceAccount = require("../burj-al-arab-server/burz-al-arab-90cba-firebase-adminsdk-apvge-9f676e5094.json");
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(bodyParser.json());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qz5k4.mongodb.net/burz-al-arab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("burz-al-arab").collection("bookings");
  console.log("connected to database");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
 
    });
  });

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        let tokenEmail = decodedToken.email;
        if (tokenEmail == req.query.email) {
          bookings
            .find({ email: req.query.email })
            .toArray((err, documents) => {
              res.status(200).send(documents);
            });
        }
      })
      .catch((error) => {
        res.status(401).send('unauthorized access')
      });
     
    }
    else{
      res.status(401).send('unauthorized access')
    }
  });
 
});


app.listen(3100);
