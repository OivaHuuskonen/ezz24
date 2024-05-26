import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dropin from "braintree-web-drop-in";
import toast from "react-hot-toast";

export default function UserCartSidebar() {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropinContainer = useRef(null);

  useEffect(() => {
    if (auth?.token) {
      getClientToken();
    }
  }, [auth?.token]);

  useEffect(() => {
    if (clientToken && dropinContainer.current) {
      // Clear the container to ensure it's empty
      dropinContainer.current.innerHTML = "";
      dropin.create(
        {
          authorization: clientToken,
          container: dropinContainer.current,
          paypal: {
            flow: "vault",
          },
        },
        (err, instance) => {
          if (err) {
            console.error(err);
          } else {
            setInstance(instance);
          }
        }
      );
    }
  }, [clientToken]);

  /*const getClientToken = async () => {
    try {
      const { data } = await axios.get("/braintree/token");
      setClientToken(data.clientToken);
    } catch (err) {
      console.log(err);
    }
  };*/

  const getClientToken = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/braintree/token", {
        headers: {
          Authorization: `Bearer ${auth?.token}`
        }
      });
      setClientToken(data.clientToken);
    } catch (err) {
      console.log(err);
    }
  };
  
  const cartTotal = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post("/braintree/payment", {
        nonce,
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment successful. Thank you for shopping with us.");
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="col-md-4 mb-5">
      <h4>Your cart summary</h4>
      Total / Address / Payments
      <hr />
      <h6>Total: {cartTotal()}</h6>
      {auth?.user?.address ? (
        <>
          <div className="mb-3">
            <hr />
            <h4>Delivery address:</h4>
            <h5>{auth?.user?.address}</h5>
          </div>
          <button
            className="btn btn-outline-warning"
            onClick={() => navigate("/dashboard/user/profile")}
          >
            Update address
          </button>
        </>
      ) : (
        <div className="mb-3">
          {auth?.token ? (
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate("/dashboard/user/profile")}
            >
              Add delivery address
            </button>
          ) : (
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() =>
                navigate("/login", {
                  state: "/cart",
                })
              }
            >
              Login to checkout
            </button>
          )}
        </div>
      )}
      <div className="mt-3">
        {!clientToken || !cart?.length ? (
          ""
        ) : (
          <>
            <div ref={dropinContainer}></div>
            <button
              onClick={handleBuy}
              className="btn btn-primary col-12 mt-2"
              disabled={!auth?.user?.address || !instance || loading}
            >
              {loading ? "Processing ..." : "Buy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}









/*import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dropin from "braintree-web-drop-in";
import toast from "react-hot-toast";

export default function UserCartSidebar() {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dropinContainer = useRef(null);

  useEffect(() => {
    if (auth?.token) {
      getClientToken();
    }
  }, [auth?.token]);

  useEffect(() => {
    if (clientToken && dropinContainer.current) {
      dropin.create(
        {
          authorization: clientToken,
          container: dropinContainer.current,
          paypal: {
            flow: "vault",
          },
        },
        (err, instance) => {
          if (err) {
            console.error(err);
          } else {
            setInstance(instance);
          }
        }
      );
    }
  }, [clientToken]);

  const getClientToken = async () => {
    try {
      const { data } = await axios.get("/braintree/token");
      setClientToken(data.clientToken);
    } catch (err) {
      console.log(err);
    }
  };

  const cartTotal = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post("/braintree/payment", {
        nonce,
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment successful. Thank you for shopping with us.");
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="col-md-4 mb-5">
      <h4>Your cart summary</h4>
      Total / Address / Payments
      <hr />
      <h6>Total: {cartTotal()}</h6>
      {auth?.user?.address ? (
        <>
          <div className="mb-3">
            <hr />
            <h4>Delivery address:</h4>
            <h5>{auth?.user?.address}</h5>
          </div>
          <button
            className="btn btn-outline-warning"
            onClick={() => navigate("/dashboard/user/profile")}
          >
            Update address
          </button>
        </>
      ) : (
        <div className="mb-3">
          {auth?.token ? (
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate("/dashboard/user/profile")}
            >
              Add delivery address
            </button>
          ) : (
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() =>
                navigate("/login", {
                  state: "/cart",
                })
              }
            >
              Login to checkout
            </button>
          )}
        </div>
      )}
      <div className="mt-3">
        {!clientToken || !cart?.length ? (
          ""
        ) : (
          <>
            <div ref={dropinContainer}></div>
            <button
              onClick={handleBuy}
              className="btn btn-primary col-12 mt-2"
              disabled={!auth?.user?.address || !instance || loading}
            >
              {loading ? "Processing ..." : "Buy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}*/













/*import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dropin from "braintree-web-drop-in";
import toast from "react-hot-toast";

export default function UserCartSidebar() {
  // Context
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  // State
  const [clientToken, setClientToken] = useState("");
  const [loading, setLoading] = useState(false);
  const dropinInstance = useRef(null);
  const dropinContainerRef = useRef(null);
  // Hooks
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.token) {
      getClientToken();
    }
  }, [auth?.token]);

  useEffect(() => {
    if (clientToken) {
      if (dropinContainerRef.current) {
        dropin.create(
          {
            authorization: clientToken,
            container: dropinContainerRef.current,
            paypal: {
              flow: "vault",
            },
          },
          (err, instance) => {
            if (err) {
              console.error(err);
              return;
            }
            dropinInstance.current = instance;
          }
        );
      }
    }
  }, [clientToken]);

  const getClientToken = async () => {
    try {
      const { data } = await axios.get("/braintree/token");
      setClientToken(data.clientToken);
    } catch (err) {
      console.log(err);
    }
  };

  const cartTotal = () => {
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      const { nonce } = await dropinInstance.current.requestPaymentMethod();
      const { data } = await axios.post("/braintree/payment", {
        nonce,
        cart,
      });
      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment successful. Thank you for shopping with us.");
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="col-md-4 mb-5">
      <h4>Your cart summary</h4>
      Total / Address / Payments
      <hr />
      <h6>Total: {cartTotal()}</h6>
      {auth?.user?.address ? (
        <>
          <div className="mb-3">
            <hr />
            <h4>Delivery address:</h4>
            <h5>{auth?.user?.address}</h5>
          </div>
          <button
            className="btn btn-outline-warning"
            onClick={() => navigate("/dashboard/user/profile")}
          >
            Update address
          </button>
        </>
      ) : (
        <div className="mb-3">
          {auth?.token ? (
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate("/dashboard/user/profile")}
            >
              Add delivery address
            </button>
          ) : (
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() =>
                navigate("/login", {
                  state: "/cart",
                })
              }
            >
              Login to checkout
            </button>
          )}
        </div>
      )}
      <div className="mt-3">
        {!clientToken || !cart?.length ? (
          ""
        ) : (
          <>
            <div id="dropin-container" ref={dropinContainerRef}></div>
            <button
              onClick={handleBuy}
              className="btn btn-primary col-12 mt-2"
              disabled={!auth?.user?.address || loading}
            >
              {loading ? "Processing ..." : "Buy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}*/






















/*import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DropIn from "braintree-web-drop-in";
import toast from "react-hot-toast";
//import { sendEmail } from "./EmailSender"; // Tuodaan sendEmail-funktio

/*export default function UserCartSidebar() {
  // context
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  // state
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  // hooks
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.token) {
      getClientToken();
    }
  }, [auth?.token]);

  const getClientToken = async () => {
    try {
      const { data } = await axios.get("/braintree/token");
      setClientToken(data.clientToken);
    } catch (err) {
      console.log(err);
    }
  };

  const cartTotal = () => {
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post("/braintree/payment", {
        nonce, 
        cart, 
      });
      console.log("hande buy response => ", data);

      if (!data.transaction) {
        console.log("Transaction data is not available");
        return;
      }

      // email ostotapahtuman jälkeen:
      let emailData = {
        to: auth.user.email,
        from: process.env.REACT_APP_EMAIL_FROM,
        subject: `Payment receipt`,
        html: `
        <h1>Payment receipt</h1>
        <p>Payment was successfull. Your order is in process.</p>
        <p>Transaction ID: ${data.transaction.id}</p>
        <p>Order total: ${data.transaction.amount}</p>
        <p>Order details: ${JSON.stringify(cart)}</p>
        <p>Thank you for shopping with us.</p>
        `,
      };

      // Send email via server-side route
      await axios.post("/send-email", emailData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
      },
      }
    );

      setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment successfull.Thank you for shopping with us."); 
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };*/


  // UserCartSidebar.js



/*export default function UserCartSidebar() {
  // Context
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  // State
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  // Hooks
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.token) {
      getClientToken();
    }
  }, [auth?.token]);

  const getClientToken = async () => {
    try {
      const { data } = await axios.get("/braintree/token");
      setClientToken(data.clientToken);
    } catch (err) {
      console.log(err);
    }
  };

  const cartTotal = () => {
    let total = 0;
    //cart.forEach((item) => {
    cart.map((item) => {
      total += item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post("/braintree/payment", {
        nonce,
        cart,
      //  userEmail: auth.user.email, // Lisätään userEmail
      });

      /*if (!data.transaction) {
        console.log("Transaction data is not available");
        return;
      }

      const emailData = {
        to: auth.user.email,
        from: process.env.REACT_APP_EMAIL_FROM,
        subject: `Payment receipt`,
        html: `
        <h1>Payment receipt</h1>
        <p>Payment was successful. Your order is in process.</p>
        <p>Transaction ID: ${data.transaction.id}</p>
        <p>Order total: ${data.transaction.amount}</p>
        <p>Order details: ${JSON.stringify(cart)}</p>
        <p>Thank you for shopping with us.</p>
        `,
      };*/

      //await sendEmail(emailData, auth.token); // Kutsu sendEmail-funktiota

      /*setLoading(false);
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success("Payment successful. Thank you for shopping with us.");
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="col-md-4 mb-5">
      <h4>Your cart summary</h4>
      Total / Address / Payments
      <hr />
      <h6>Total: {cartTotal()}</h6>
      {auth?.user?.address ? (
       <>
          <div className="mb-3">
            <hr />
            <h4>Delivery address:</h4>
            <h5>{auth?.user?.address}</h5>
          </div>
          <button
            className="btn btn-outline-warning"
            onClick={() => navigate("/dashboard/user/profile")}
          >
            Update address
          </button>
          </>
      ) : (
        <div className="mb-3">
          {auth?.token ? (
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate("/dashboard/user/profile")}
            >
              Add delivery address
            </button>
          ) : (
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() =>
                navigate("/login", {
                  state: "/cart",
                })
              }
            >
              Login to checkout
            </button>
          )}
        </div> 
      )}
      <div className="mt-3">
        
        {!clientToken || !cart?.length ? (
          ""
        ) : (
          <>
            <DropIn
              options={{
                authorization: clientToken,
                paypal: {
                  flow: "vault",
                },
              }}
              onInstance={(instance) => setInstance(instance)}
            />
            <button
              onClick={handleBuy}
              className="btn btn-primary col-12 mt-2"
              disabled={!auth?.user?.address || !instance || loading }
            >
              {loading ? "Processing ..." : "Buy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}*/







/* og, mokattu import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DropIn from "braintree-web-drop-in-react";
import toast from "react-hot-toast";

export default function UserCartSidebar() {
  // context
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  // state
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  // hooks
  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.token) {
      getClientToken();
    }
  }, [auth?.token]);

  const getClientToken = async () => {
    try {
      const { data } = await axios.get("/braintree/token");
      setClientToken(data.clientToken);
    } catch (err) {
      console.log(err);
    }
  };

  const cartTotal = () => {
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleBuy = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      //console.log("nonce => ", nonce);
      const { data } = await axios.post("/braintree/payment", {
        nonce, 
        cart, 
    });
    console.log("hande buy response => ", data);

    // email ostotapahtuman jälkeen:
    let emailData = {
      to: auth.user.email,
      from: process.env.REACT_APP_EMAIL_FROM,
      subject: `Payment receipt`,
      html: `
      <h1>Payment receipt</h1>
      <p>Payment was successfull. Your order is in process.</p>
      <p>Transaction ID: ${data.transaction.id}</p>
      <p>Order total: ${data.transaction.amount}</p>
      <p>Order details: ${JSON.stringify(cart)}</p>
      <p>Thank you for shopping with us.</p>
      `,
    };

    let info = await transporter.sendMail(emailData);
    console.log('message sent: %s', info.messageId);

    setLoading(false);
    localStorage.removeItem("cart");
    setCart([]);
    navigate("/dashboard/user/orders");
    toast.success("Payment successfull.Thank you for shopping with us."); 
  } catch (err) {
      console.log(err);
      setLoading(false);

    // Jos virhe johtuu virheellisistä tai vanhentuneista OAuth2-tunnuksista, saat lisätietoja seuraavasti:
    if (err.code === 'EAUTH' && err.command === 'AUTH XOAUTH2') {
      console.log('Invalid or expired tokens. Please check your OAuth2 configuration.');
    }
  }
};


  return (
    <div className="col-md-4 mb-5">
      <h4>Your cart summary</h4>
      Total / Address / Payments
      <hr />
      <h6>Total: {cartTotal()}</h6>
      {auth?.user?.address ? (
       <>
          <div className="mb-3">
            <hr />
            <h4>Delivery address:</h4>
            <h5>{auth?.user?.address}</h5>
          </div>
          <button
            className="btn btn-outline-warning"
            onClick={() => navigate("/dashboard/user/profile")}
          >
            Update address
          </button>
          </>
      ) : (
        <div className="mb-3">
          {auth?.token ? (
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate("/dashboard/user/profile")}
            >
              Add delivery address
            </button>
          ) : (
            <button
              className="btn btn-outline-danger mt-3"
              onClick={() =>
                navigate("/login", {
                  state: "/cart",
                })
              }
            >
              Login to checkout
            </button>
          )}
        </div> 
      )}
      <div className="mt-3">
        
        {!clientToken || !cart?.length ? (
          ""
        ) : (
          <>
            <DropIn
              options={{
                authorization: clientToken,
                paypal: {
                  flow: "vault",
                },
              }}
              onInstance={(instance) => setInstance(instance)}
            />
            <button
              onClick={handleBuy}
              className="btn btn-primary col-12 mt-2"
              disabled={!auth?.user?.address || !instance || loading }
            >
              {loading ? "Processing ..." : "Buy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

//<div>{JSON.stringity(clientToken)}</div>*/
