import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import Jumbotron from "../../components/cards/Jumbotron";
import AdminMenu from "../../components/nav/AdminMenu";
import axios from "axios";
import moment from "moment";
import ProductCardHorizontal from "../../components/cards/ProductCardHorizontal";
import { Select } from "antd";

const { Option } = Select;

export default function AdminOrders() {
  const [auth, setAuth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState([
    "awaiting processing",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]);
  const [changedStatus, setChangedStatus] = useState("");

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const getOrders = async () => {
    try {
      const { data } = await axios.get("/all-orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = async (orderId, value) => {
    setChangedStatus(value);
    try {
      const { data } = await axios.put(`/order-status/${orderId}`, {
        status: value,
      });
      getOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const removeOrder = async (orderId) => {
    try {
      const { data } = await axios.delete(`/order/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId)); // Update state to remove the order
      console.log("Order removed successfully");
    } catch (error) {
      console.log("Error removing order:", error);
    }
  };

  return (
    <>
      <Jumbotron title={`Hello ${auth?.user?.name}`} subTitle="Dashboard" />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="p-3 mt-2 mb-2 h4 bg-light">Orders</div>
            {orders?.map((o, i) => (
              <div key={o._id} className="border shadow bg-light rounded-4 mb-5">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Status</th>
                      <th scope="col">Buyer</th>
                      <th scope="col">Order</th>
                      <th scope="col">Payment</th>
                      <th scope="col">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{i + 1}</td>
                      <td>
                        <Select
                          onChange={(value) => handleChange(o._id, value)}
                          defaultValue={o?.status}
                        >
                          {status.map((s, i) => (
                            <Option key={i} value={s}>
                              {s}
                            </Option>
                          ))}
                        </Select>
                      </td>
                      <td>{o?.buyer?.name}</td>
                      <td>{moment(o?.createdAt).fromNow()}</td>
                      <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                      <td>{o?.products?.length} products</td>
                    </tr>
                  </tbody>
                </table>
                <div className="container">
                  <div className="row m-2">
                    {o?.products?.map((p, i) => (
                      <ProductCardHorizontal key={i} p={p} remove={true} onRemove={() => removeOrder(o._id)} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}



/*import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import Jumbotron from "../../components/cards/Jumbotron";
import AdminMenu from "../../components/nav/AdminMenu";
import axios from "axios";
import moment from "moment";
import ProductCardHorizontal from "../../components/cards/ProductCardHorizontal";
import { Select } from "antd";

const { Option } = Select;

export default function AdminOrders() {
  const [auth, setAuth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState([
    "awaiting processing",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]);
  const [changedStatus, setChangedStatus] = useState("");

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const getOrders = async () => {
    try {
      console.log("Fetching orders with token:", auth.token);
      const { data } = await axios.get("/all-orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = async (orderId, value) => {
    console.log("Muutos status:");
    console.log("Order ID:", orderId);
    console.log("Status:", status);
    setChangedStatus(value);
    try {
      const { data } = await axios.put(`/order-status/${orderId}`, {
        status: value,
      });
      getOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const removeOrder = async (orderId) => {
    try {
      console.log("Attempting to remove order ID:", orderId); // Debug
      const { data } = await axios.delete(`/order/${orderId}`);
      console.log("Remove order response data:", data); // Debug
      getOrders(); // Refresh the list of orders
    } catch (error) {
      console.log("Error removing order:", error);
    }
  };

  return (
    <>
      <Jumbotron title={`Hello ${auth?.user?.name}`} subTitle="Dashboard" />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="p-3 mt-2 mb-2 h4 bg-light">Orders</div>
            {orders?.map((o, i) => (
              <div key={o._id} className="border shadow bg-light rounded-4 mb-5">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Status</th>
                      <th scope="col">Buyer</th>
                      <th scope="col">Order</th>
                      <th scope="col">Payment</th>
                      <th scope="col">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{i + 1}</td>
                      <td>
                        <Select
                          onChange={(value) => handleChange(o._id, value)}
                          defaultValue={o?.status}
                        >
                          {status.map((s, i) => (
                            <Option key={i} value={s}>
                              {s}
                            </Option>
                          ))}
                        </Select>
                      </td>
                      <td>{o?.buyer?.name}</td>
                      <td>{moment(o?.createdAt).fromNow()}</td>
                      <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                      <td>{o?.products?.length} products</td>
                    </tr>
                  </tbody>
                </table>
                <div className="container">
                  <div className="row m-2">
                    {o?.products?.map((p, i) => (
                      <ProductCardHorizontal key={i} p={p} remove={true} onRemove={() => removeOrder(o._id)} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}*/




/*import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import Jumbotron from "../../components/cards/Jumbotron";
import AdminMenu from "../../components/nav/AdminMenu";
import axios from "axios";
import moment from "moment";
import ProductCardHorizontal from "../../components/cards/ProductCardHorizontal";
import { Select } from "antd";

const { Option } = Select;

export default function AdminOrders() {
  const [auth, setAuth] = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState([
    "awaiting processing",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]);
  const [changedStatus, setChangedStatus] = useState("");

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const getOrders = async () => {
    try {
      console.log("Fetching orders with token:", auth.token);
      const { data } = await axios.get("/all-orders");
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = async (orderId, value) => {
    console.log("Muutos status:");
    console.log("Order ID:", orderId);
    console.log("Status:", status);
    setChangedStatus(value);
    try {
      const { data } = await axios.put(`/order-status/${orderId}`, {
        status: value,
      });
      getOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const removeOrder = async (orderId) => {
    try {
      const { data } = await axios.delete(`/order/${orderId}`);
      getOrders(); // Refresh the list of orders
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Jumbotron title={`Hello ${auth?.user?.name}`} subTitle="Dashboard" />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="p-3 mt-2 mb-2 h4 bg-light">Orders</div>
            {orders?.map((o, i) => (
              <div key={o._id} className="border shadow bg-light rounded-4 mb-5">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Status</th>
                      <th scope="col">Buyer</th>
                      <th scope="col">Order</th>
                      <th scope="col">Payment</th>
                      <th scope="col">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{i + 1}</td>
                      <td>
                        <Select
                          onChange={(value) => handleChange(o._id, value)}
                          defaultValue={o?.status}
                        >
                          {status.map((s, i) => (
                            <Option key={i} value={s}>
                              {s}
                            </Option>
                          ))}
                        </Select>
                      </td>
                      <td>{o?.buyer?.name}</td>
                      <td>{moment(o?.createdAt).fromNow()}</td>
                      <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                      <td>{o?.products?.length} products</td>
                    </tr>
                  </tbody>
                </table>
                <div className="container">
                  <div className="row m-2">
                    {o?.products?.map((p, i) => (
                      <ProductCardHorizontal key={i} p={p} remove={true} onRemove={removeOrder}/>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}*/







/*import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import Jumbotron from "../../components/cards/Jumbotron";
import AdminMenu from "../../components/nav/AdminMenu";
import axios from "axios";
import moment from "moment";
import ProductCardHorizontal from "../../components/cards/ProductCardHorizontal";
import { Select} from "antd";

const { Option } = Select;

export default function AdminOrders() {
  // context
  const [auth, setAuth] = useAuth();
  // state
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState([
    "Not processed",
    "Processing",
    "Shipped",
    "Delivered",        
    "Cancelled",
  ]);

  const [changedStatus, setChangedStatus] = useState("");

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]); 

  const getOrders = async () => {
    try {
      console.log("Fetching orders with token:", auth.token); // Tarkista, että token lähetetään pyynnöissä
      const { data } = await axios.get("/all-orders");
      /*const { data } = await axios.get("/all-orders", { 
          headers: {
            Authorization: `Bearer ${auth.token}`, // Lisää Authorization-otsake
          },
        });*/
  /*    setOrders(data);
    } catch (error) {
      console.log(error);
    }
  }    

  const handleChange = async (orderId, value) => {
    console.log("Muutos status:");
    console.log("Order ID:", orderId);
    console.log("Status:", status);

     setChangedStatus(value);
     try {
      const { data } = await axios.put(`/order-status/${orderId}`, {
        status: value,
      });*/
       /*const { data } = await axios.put(`/order-status/${orderId}`, { 
        status: value, 
       }, {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Lisää Authorization-otsake
          },
       });*/
    /*   getOrders();
      } catch (error) {
       console.log(error);
     }
  }

  return (
    <>
      <Jumbotron title={`Hello ${auth?.user?.name}`} subTitle="Dashboard" />

      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="p-3 mt-2 mb-2 h4 bg-light">Orders</div>
           
            {orders?.map((o, i) => {
              return (
                <div key={o._id} className="border shadow bg-light rounded-4 mb-5"
                >
                   <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Status</th>
                        <th scope="col">Buyer</th>
                        <th scope="col">Order</th>
                        <th scope="col">Payment</th>
                        <th scope="col">Quantity</th>
                      </tr>                    
                    </thead>

                    <tbody>
                      <tr>
                        <td>{i + 1}</td>
                        <td>
                          <Select 
                          variant="filled"
                        //  {...props}
                          onChange={(value) => handleChange(o._id, value)}
                          defaultValue={o?.status}
                          >
                              {status.map((s, i) => 
                                <Option key={i} value={s}>
                                  {s} 
                                </Option>
                              )}                 
                          </Select>
                        </td>
                        <td>{o?.buyer?.name}</td>
                        <td>{moment(o?.createdAt).fromNow()}</td>
                        <td>{o?.payment?.success ? "Success" : "Failed"}</td>
                        <td>{o?.products?.length} products</td>
                      </tr>
                   </tbody>
                   </table>

                   <div className="container">
                    <div className="row m-2">
                      {o?.products?.map((p, i) => (
                        <ProductCardHorizontal key={i} p={p} remove={false} />
                      ))}
                    </div>
                  </div>

                </div>
               )
              })}
          </div>
        </div>
      </div>
    </>
  );
}*/
