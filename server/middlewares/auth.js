import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const requireSignin = (req, res, next) => {
  try {
    console.log("Require signin middleware triggered"); //osoittaa, että [`isAdmin`] "server/middlewares/auth.js") väliohjelmisto on aktivoitu.
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "JWT token missing" });//onko pyynnössä "valtuutus"-otsikko. Tämä otsikko sisältää yleensä JWT:n (JSON Web Token), jota käytetään käyttäjän todentamiseen. Jos "valtuutus"-otsikkoa ei ole, funktio vastaa tilakoodilla 401 (ilmaisee luvattoman käytön) ja JSON-objektilla, joka sisältää virheilmoituksen.
    }
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(err);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    console.log("Is admin middleware triggered");
    console.log("User ID:", req.user._id); // Lisää tämä rivi tulostamaan käyttäjän ID
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "JWT token missing" });
    }
    const user = await User.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send("Unauthorized");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};
