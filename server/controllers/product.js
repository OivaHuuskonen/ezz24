import Product from "../models/product.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import Order from "../models/order.js";
import sgMail from "@sendgrid/mail";

dotenv.config();

//console.log("SendGrid Key:", process.env.SENDGRID_KEY);
//console.log("Email From:", process.env.EMAIL_FROM);

sgMail.setApiKey(process.env.SENDGRID_KEY);

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const create = async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files);
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // validation
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !price.trim():
        return res.json({ error: "Price is required" });
      case !category.trim():
        return res.json({ error: "Category is required" });
      case !quantity.trim():
        return res.json({ error: "Quantity is required" });
      case !shipping.trim():
        return res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
        return res.json({ error: "Image should be less than 1mb in size" });
    }

    // create product
    const product = new Product({ ...req.fields, slug: slugify(name) });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

export const list = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const photo = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "photo"
    );
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.send(product.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

export const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.productId
    ).select("-photo");
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const update = async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files);
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // validation
    switch (true) {
      case !name.trim():
        res.json({ error: "Name is required" });
      case !description.trim():
        res.json({ error: "Description is required" });
      case !price.trim():
        res.json({ error: "Price is required" });
      case !category.trim():
        res.json({ error: "Category is required" });
      case !quantity.trim():
        res.json({ error: "Quantity is required" });
      case !shipping.trim():
        res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
        res.json({ error: "Image should be less than 1mb in size" });
    }

    // update product
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

export const filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    console.log("args => ", args);

    const products = await Product.find(args);
    console.log("filtered products query => ", products.length);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const productsCount = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount();
    res.json(total);
  } catch (err) {
    console.log(err);
  }
};

export const listProducts = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const products = await Product.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const productsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    res.json(results);
  } catch (err) {
    console.log(err);
  }
};

export const relatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    const related = await Product.find({
      category: categoryId,
      _id: { $ne: productId },
    })
      .select("-photo")
      .populate("category")
      .limit(3);

    res.json(related);
  } catch (err) {
    console.log(err);
  }
};

export const getToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const processPayment = async (req, res) => {
  try {
    // console.log(req.body);
    const { nonce, cart } = req.body;

    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    // console.log("total => ", total);

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          // res.send(result);
          // create order
          const order = new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          // decrement quantity
          decrementQuantity(cart);
          /*  const bulkOps = cart.map((item) => {
            return {
               updateOne: {
                 filter: { _id: item._id },
                 update: { $inc: { quantity: -0, sold: +1 } },
               },
             };
           });*/

          // Product.bulkWrite(bulkOps, {});

          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const decrementQuantity = async (cart) => {
  try {
    // build mongodb query
    const bulkOps = cart.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { quantity: -0, sold: +1 } },
        },
      };
    });

    const updated = await Product.bulkWrite(bulkOps, {});
    console.log("blk updated", updated);
  } catch (err) {
    console.log(err);
  }
};

export const orderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("buyer", "email name");
    console.log("Order:", order);
    // testi email:
   /* const emailData = {
      from: process.env.EMAIL_FROM,
      to: "Solarsystems3@example.com",  // Korvaa omalla sähköpostiosoitteellasi
      subject: "Test Email",
      html: "<h1>This is a test email</h1>",
    };

    try {
      const response = await sgMail.send(emailData);
      console.log("Test email sent successfully:", response);
    } catch (err) {
      console.error("Error sending test email:", err);
    }*/

    // varsinainen email: 

   const orderEmailData = {
      from: process.env.EMAIL_FROM,
      to: order.buyer.email,
      subject: "Your order status",
      html: `
        <h1>Hello ${order.buyer.name}, Your order's status is: <span style="color:red;">${order.status}</span> Best regards, Jumble Store</h1>
        <p>Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">your dashboard</a> for more details</p>
      `,
    };

    try {
      const response = await sgMail.send(orderEmailData);
      console.log("Email sent successfully:", response);
    } catch (err) {
      console.error("Error sending email:", err);
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Error updating order status" });
  }
};

































/*import Product from "../models/product.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import Order from "../models/order.js";
//import AWS from "aws-sdk";

dotenv.config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

  // määritä AWS-asiakas:
  /*const SES = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });*/

/*export const create = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photo } = req.files;

    // validation
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !price.trim():
        return res.json({ error: "Price is required" });
      case !category.trim():
        return res.json({ error: "Category is required" });
      case !quantity.trim():
        return res.json({ error: "Quantity is required" });
      case !shipping.trim():
        return res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
        return res.json({ error: "Image should be less than 1mb in size" });
    }

    // create product
    const product = new Product({ ...req.fields, slug: slugify(name) });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

export const list = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const photo = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "photo"
    );
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.send(product.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

export const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.productId
    ).select("-photo");
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const update = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // validation
    switch (true) {
      case !name.trim():
        res.json({ error: "Name is required" });
      case !description.trim():
        res.json({ error: "Description is required" });
      case !price.trim():
        res.json({ error: "Price is required" });
      case !category.trim():
        res.json({ error: "Category is required" });
      case !quantity.trim():
        res.json({ error: "Quantity is required" });
      case !shipping.trim():
        res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
        res.json({ error: "Image should be less than 1mb in size" });
    }

    // update product
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

export const filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    console.log("args => ", args);

    const products = await Product.find(args);
    console.log("filtered products query => ", products.length);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const productsCount = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount();
    res.json(total);
  } catch (err) {
    console.log(err);
  }
};

export const listProducts = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const products = await Product.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const productsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    res.json(results);
  } catch (err) {
    console.log(err);
  }
};

export const relatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    const related = await Product.find({
      category: categoryId,
      _id: { $ne: productId },
    })
      .select("-photo")
      .populate("category")
      .limit(3);

    res.json(related);
  } catch (err) {
    console.log(err);
  }
};


//Tämä funktio generoi maksutokenin Braintree-palvelusta.
// Tokenia käytetään myöhemmin maksujen käsittelyssä.
export const getToken = async (req, res) => { 
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};*/

//Tämä funktio käsittelee maksuja. Se ottaa vastaan maksutiedot (kuten maksutokenin ja ostoskorin) ja laskee yhteen ostoskorin tuotteiden 
//hinnat. Sen jälkeen se suorittaa maksutapahtuman Braintree-palvelussa. Jos maksu onnistuu, se tallentaa tilauksen tietokantaan ja vähentää
// tuotteiden määrää. Lopuksi se lähettää sähköpostiviestin ostajalle tilauksen vahvistamiseksi.
/*export const processPayment = async (req, res) => { 
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price
    })

    gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) { // Make this function async
        if (result) {
          if(!req.user) {
            return res.status(500).send("User not found");
            return;
          }
          const order = new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          decrementQuantity(cart);   
       
          res.json({ ok:true });
        } else {
          res.status(500).send(error);
        }
      } 
    );
  } catch (err) {
    console.log("Error in processPayment function", err);
    res.status(500).send({ error: "Internal server error" });
  }
};  

// order jälkeen:
// Tämä funktio vähentää tuotteiden määrää tietokannassa. Se käyttää MongoDB-kyselyitä päivittääkseen tuotteiden määrää
// ja myytyjen tuotteiden lukumäärää.
const decrementQuantity = async (cart) => {  
  try {  
      // build mongodb query
        const bulkOps = cart.map((item) => {
              return {
                updateOne: {
                  filter: { _id: item._id },
                  update: { $inc: { quantity: -1, sold: +1 } },
                },
              };
            });

    const updated = await Product.bulkWrite(bulkOps, {});
    console.log("blk updated", updated);
  } catch (err) {
    console.log(err);
  }
};*/

//Tämä funktio päivittää tilauksen tilan ja lähettää sähköpostiviestin tilauksen ostajalle. 
//Se käyttää AWS SES:ää sähköpostin lähettämiseen. Sähköpostiviestin sisältö sisältää tilauksen tilan
// ja linkin käyttäjän kojelautaan lisätietojen tarkastelemiseksi.

/*export const orderStatus = async (req, res) => { 

  try {
    const { orderId } = req.params; // tämä purkaa req.params objektista order id muuttujan. req.params sisältää reitityksen parametrit (URL polku)
    const { status } = req; // tämä purkaa req. objektista status muuttujan. req. sisältää http(POST)-pyynnön tiedot 
  
    console.log('Received PUT request to /api/admin-order-status/', req.params.orderId); // tuleeko pyyntö oikeaan reittiin? saapuuko orderID oikein palvelimelle?
  
    const order = await Order.findByIdAndUpdate( // etsitään tilaus tietokannasta ja päivitetään sen status + haetaan ostajan (buyer) email
      orderId,
      { status },
      { new: true}
      ).populate(
        "buyer", 
        "email"
      );*/

    // Määritä sähköpostin tiedot  
    // Lähetetään sähköposti vain, jos tilauksen tila on "shipped", "delivered", "delivered" tai "cancelled"
  /*  if (["Not processed", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
    const emailParams = {
      Destination: {
        ToAddresses: [order.buyer.email], // vastaanottajan sähköpostiosoite(t)
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
            <html>
              <body>
              <h1>Hello, ${order.buyer.name} tilauksesi tila on: <span style="color:red;">${order.status}</span></h1>
              <p>Vieraile <a href="${process.env.CLIENT_URL}/dashboard/user/orders">dashboardillasi</a> niin saat lisätietoja.</p>
              </body>
            </html>
            `,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Tilauksesi tila: ', // viestin otsikko
        },
      },
      Source: process.env.EMAIL_FROM, // lähettäjän sähköpostiosoite
    };
    
    // Lähetetään sähköposti AWS SES:n kautta
      sendEmail(emailParams, (err, data) => {
      if (err) {
        console.log("Virhe sähköpostia lähettäessä:", err);
      } else {
        console.log("Sähköposti lähetetty onnistuneesti:", data);
      }
    });
  }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};*/






    // luodaan sähköpostin sisältö. Sähköposti lähetetään tilauksen ostajalle ja se sisältää tilauksen tilan. 
    /*const emailData = {
      from: process.env.EMAIL_FROM,
      to: order.buyer.email,
      subject: "Order status",
      html: `
        <h1>Hi ${order.buyer.name}, Your order's status is: <span style="color:red;">${order.status}</span></h1>
        <p>Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">your dashboard</a> for more details</p>
      `,
    };*/
    
 


/*SES.sendEmail(params, (err, data) => {
  if (err) {
    console.log('Virhe sähköpostia lähettäessä:', err);
  } else {
    console.log('Sähköposti lähetetty onnistuneesti:', data);
  }
});*/








/*import Product from "../models/product.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import Order from "../models/order.js";
import AWS from "aws-sdk";
dotenv.config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

  // määritä AWS-asiakas:
  const ses = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  // Määritä sähköpostin tiedot
const params = {
  Destination: {
    ToAddresses: [auth.user.email], // vastaanottajan sähköpostiosoite(t)
  },
  Message: {
    Body: {
      Text: {
        Data: 'Tämä on testiviesti AWS SES:n kautta', // viestin sisältö
      },
    },
    Subject: {
      Data: 'Testiviesti AWS SES:n kautta', // viestin otsikko
    },
  },
  Source: 'jukka.ilveskorpi@gmail.com', // lähettäjän sähköpostiosoite
};

// Lähetä sähköposti
ses.sendEmail(params, (err, data) => {
  if (err) {
    console.log('Virhe sähköpostia lähettäessä:', err);
  } else {
    console.log('Sähköposti lähetetty onnistuneesti:', data);
  }
});

export const create = async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files);
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // validation
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !price.trim():
        return res.json({ error: "Price is required" });
      case !category.trim():
        return res.json({ error: "Category is required" });
      case !quantity.trim():
        return res.json({ error: "Quantity is required" });
      case !shipping.trim():
        return res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
        return res.json({ error: "Image should be less than 1mb in size" });
    }

    // create product
    const product = new Product({ ...req.fields, slug: slugify(name) });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

export const list = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const photo = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "photo"
    );
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.send(product.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

export const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.productId
    ).select("-photo");
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const update = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // validation
    switch (true) {
      case !name.trim():
        res.json({ error: "Name is required" });
      case !description.trim():
        res.json({ error: "Description is required" });
      case !price.trim():
        res.json({ error: "Price is required" });
      case !category.trim():
        res.json({ error: "Category is required" });
      case !quantity.trim():
        res.json({ error: "Quantity is required" });
      case !shipping.trim():
        res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
        res.json({ error: "Image should be less than 1mb in size" });
    }

    // update product
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

export const filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    console.log("args => ", args);

    const products = await Product.find(args);
    console.log("filtered products query => ", products.length);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const productsCount = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount();
    res.json(total);
  } catch (err) {
    console.log(err);
  }
};

export const listProducts = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const products = await Product.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const productsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    res.json(results);
  } catch (err) {
    console.log(err);
  }
};

export const relatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    const related = await Product.find({
      category: categoryId,
      _id: { $ne: productId },
    })
      .select("-photo")
      .populate("category")
      .limit(3);

    res.json(related);
  } catch (err) {
    console.log(err);
  }
};

export const getToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const handlePayment = async (req, res) => {
  try {
    // hae asiakkaan tiedot
    const { nonce, cart, userEmail } = req.body;

  
    // Tarkista, että userEmail on määritelty ja se on kelvollinen sähköpostiosoite
    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

  /*} catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};*/

   // Esimerkki: Lähetä sähköposti ostoksen jälkeen
 /*  const emailData = {
    to: userEmail,
    from: process.env.REACT_APP_EMAIL_FROM,
    subject: "Payment receipt",
    html: `
      <h1>Payment receipt</h1>
      <p>Payment was successful. Your order is in process.</p>
      <p>Order details: ${JSON.stringify(cart)}</p>
      <p>Thank you for shopping with us.</p>
    `,
  };

  // Lähetä sähköposti
  await sendEmail(emailData);  */

  // Muu toiminnallisuus tässä

  // ...

  // Palauta vastaus
/*  res.status(200).json({ success: true, message: "Payment successful" });
} catch (err) {
  console.log(err);
  res.status(500).json({ error: "Internal server error" });
}
};


export const processPayment = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price
    })

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) { // Make this function async
        if (result) {
          const order = new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
            buyerEmail: req.user.email, // Add buyer email
          })
          console.log('Saving order');
          await order.save(); // Now you can use await here
          console.log('Order saved');
          // decrement quantity:
          console.log('Decrementing quantity');
          await decrementQuantity(cart);   
          console.log('Quantity decremented');  */
          
   // Send email to customer
  /* const emailDataCustomer = {
    from: process.env.USER_EMAIL_SENDER,
    //to: auth.user.email,
    to: order.buyerEmail,
    subject: 'Order Confirmation',
    text: `Your order has been confirmed. Your order total is ${total}.`
  };
  await sendEmail(emailDataCustomer);

  // Send email to admin
  const emailDataAdmin = {
    from: process.env.USER_EMAIL_SENDER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Order',
    text: `A new order has been placed. The order total is ${total}.`
  };
  await sendEmail(emailDataAdmin);
           
          res.json({ ok:true, transaction: result.transaction });
        } else {
          res.status(500).send(error);
        }
      } // This closing parenthesis was missing
    );
  } catch (err) {
    console.log("Error in processPayment function", err);
  }
};  */


///  order jälkeen:

/*const decrementQuantity = async (cart) => {
  try {  */
    // build mongodb query
 /*   const bulkOps = cart.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { quantity: -0, sold: +1 } },
        },
      };
    });

    const updated = await Product.bulkWrite(bulkOps, {});
    console.log("blk updated", updated);
  } catch (err) {
    console.log(err);
  }
};

export const sendEmail = async (emailData) => {
  console.log('Sending email', emailData);
  try {
    let info = await ses.sendEmail({
      Source: emailData.from,
      Destination: {
        ToAddresses: [emailData.to],
      },
      Message: {
        Subject: {
          Data: emailData.subject,
        },
        Body: {
          Text: {
            Data: emailData.text,
          },
          Html: {
            Data: emailData.html,
          },
        },
      },
    }).promise();
    console.log('Message sent: %s', info.MessageId);
    console.log('Email sent successfully');
  } catch (err) {
    console.log('Error sending email', err);
    console.log('Error occurred ' + err.message);
    if (err.code === 'EAUTH' && err.command === 'AUTH XOAUTH2') {
      console.log('Invalid or expired tokens. Check out your aws config');
    }
  }
};

export const orderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true}
    ).populate(
      "buyer", 
      "email"
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: order.buyer.email,
      subject: "Order status",
      html: `
        <h1>Hi ${order.buyer.name}, Your order's status is: <span style="color:red;">${order.status}</span></h1>
        <p>Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">your dashboard</a> for more details</p>
      `,
    };
    await sendEmail(emailData);
    res.json(order);
  } catch (err) {
    console.log(err);
  }
}; */


