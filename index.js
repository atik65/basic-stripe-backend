const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.stripeKey);

const { v4: uuid } = require("uuid");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// port
const port = process.env.PORT || 5000;

// routes

app.get("/", (req, res) => {
  res.send("Welcome to Stripe BackEnd");
});

app.post("/payment", (req, res) => {
  const { token, product } = req.body;

  const idempotencyKey = uuid();

  return stripe.customers
    .create({
      email: token.email,
      name: token.card.name,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,

          description: `Purchase of ${product.name}`,
          shipping: {
            name: token.card.name,

            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((error) => console.log(error));
});

// listen part

app.listen(port, () => {
  console.log("Listening to port = ", port);
});
