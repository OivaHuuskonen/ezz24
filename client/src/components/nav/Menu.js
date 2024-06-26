
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import Search from "../forms/Search";
import useCategory from "../../hooks/useCategory";
import { useCart } from "../../context/cart";
import { Badge } from "antd";

export default function Menu() {
  // context
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  // hooks
  const categories = useCategory();
  const navigate = useNavigate();

  const logout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  console.log(categories); // varmistetaan että useCategory hook palauttaa taulukon kategorioista

  return (
    <ul className="nav d-flex justify-content-between shadow-sm mb-2 sticky-top bg-light">
      {/* ... muut listaelementit ... */}


      <li className="nav-item">
        <NavLink className="nav-link" aria-current="page" to="/">
          HOME
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className="nav-link" aria-current="page" to="/shop">
          SHOP
        </NavLink>
      </li>

      <li className="nav-item dropdown">
        <button
          className="nav-link pointer dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          CATEGORIES
        </button>

        <ul
          className="dropdown-menu"
          style={{ height: "300px", overflow: "scroll" }}
        >
          <li>
            <NavLink className="nav-link" to="/categories">
              All Categories
            </NavLink>
          </li>

          {Array.isArray(categories) ? (
            categories.map((c) => (
              <li key={c._id}>
                <NavLink className="nav-link" to={`/category/${c.slug}`}>
                  {c.name}
                </NavLink>
              </li>
            ))
          ) : (
            <li>Categories not available</li>
          )}
        </ul>
      </li>

      {/* ... muut listaelementit ... */}




      <li className="nav-item mt-1">
        <Badge
          count={cart?.length >= 1 ? cart.length : 0}
          offset={[-5, 11]}
          showZero={true}
        >
          <NavLink className="nav-link" aria-current="page" to="/cart">
            CART
          </NavLink>
        </Badge>
      </li>

      <Search />

      {!auth?.user ? (
        <>
          <li className="nav-item">
            <NavLink className="nav-link" to="/login">
              LOGIN
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/register">
              REGISTER
            </NavLink>
          </li>
        </>
      ) : (
        <li className="nav-item dropdown">
          <button
            className="nav-link pointer dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            {auth?.user?.name?.toUpperCase()}
          </button>

          <ul className="dropdown-menu">
            <li>
              <NavLink
                className="nav-link"
                to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}
              >
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item pointer">
              <button onClick={logout} className="nav-link">
                Logout
              </button>
            </li>
          </ul>
        </li>
      )}
 


    </ul>
  );
}








/*import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import Search from "../forms/Search";
import useCategory from "../../hooks/useCategory";
import { useCart } from "../../context/cart";
import { Badge } from "antd";

export default function Menu() {
  // context
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  // hooks
  const categories = useCategory();
  const navigate = useNavigate();

  const logout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const arrayS = Array.isArray(s) ? s : [s];

  console.log(categories) // varmistetaan että useCategory hook palauttaa taulukon kategorioista

  return (
    <ul className="nav d-flex justify-content-between shadow-sm mb-2 sticky-top bg-light">
      <li className="nav-item">
        <NavLink className="nav-link" aria-current="page" to="/">
          HOME
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className="nav-link" aria-current="page" to="/shop">
          SHOP
        </NavLink>
      </li>

      <li className="nav-item dropdown">
        <button
          className="nav-link pointer dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          CATEGORIES
        </button>

        <ul
          className="dropdown-menu"
          style={{ height: "300px", overflow: "scroll" }}
        >
          <li>
            <NavLink className="nav-link" to="/categories">
              All Categories
            </NavLink>
          </li>

          if (Array.isArray(s)) {
            categories?.map((c) => (
              <li key={c._id}>
                <NavLink className="nav-link" to={`/category/${c.slug}`}>
                  {c.name}
                </NavLink>
              </li>
            ))
          } else {
            console.error("Error: categories (s) is not an array")
          }

          {/*{categories?.map((c) => (
            <li key={c._id}>
              <NavLink className="nav-link" to={`/category/${c.slug}`}>
                {c.name}
              </NavLink>
            </li>
          ))}*/
      /*  </ul>
      </li>

      <li className="nav-item mt-1">
        <Badge
          count={cart?.length >= 1 ? cart.length : 0}
          offset={[-5, 11]}
          showZero={true}
        >
          <NavLink className="nav-link" aria-current="page" to="/cart">
            CART
          </NavLink>
        </Badge>
      </li>

      <Search />

      {!auth?.user ? (
        <>
          <li className="nav-item">
            <NavLink className="nav-link" to="/login">
              LOGIN
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/register">
              REGISTER
            </NavLink>
          </li>
        </>
      ) : (
        <li className="nav-item dropdown">
          <button
            className="nav-link pointer dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            {auth?.user?.name?.toUpperCase()}
          </button>

          <ul className="dropdown-menu">
            <li>
              <NavLink
                className="nav-link"
                to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`}
              >
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item pointer">
              <button onClick={logout} className="nav-link">
                Logout
              </button>
            </li>
          </ul>
        </li>
      )}
    </ul>
  );
}*/










/*import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import Search from "../forms/Search";
import useCategory from "../../hooks/useCategory";
import { useCart } from "../../context/cart";
import { Badge } from "antd";

export default function Menu() {
  // context
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  // hooks
  const categories = useCategory();
  const navigate = useNavigate();

  // console.log("categories in menu => ", categories);

  const logout = () => {
    setAuth({ ...auth, user: null, token: "" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <>
      <ul className="nav d-flex justify-content-between shadow-sm mb-2 sticky-top bg-light">
        <li className="nav-item">
          <NavLink className="nav-link" aria-current="page" to="/">
            HOME
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link" aria-current="page" to="/shop">
            SHOP
          </NavLink>
        </li>

        <li className="nav-item dropdown">
            <a
              className="nav-link pointer dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              CATEGORIES
            </a>

            <ul
              className="dropdown-menu"
              style={{ height: "300px", overflow: "scroll" }}
            >
              <li>
                <NavLink className="nav-link" to="/categories">
                  All Categories
                </NavLink>
              </li>

              {categories?.map((c) => (
                <li key={c._id}>
                  <NavLink className="nav-link" to={`/category/${c.slug}`}>
                    {c.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
       </>

        <li className="nav-item mt-1">
          <Badge
            count={cart?.length >= 1 ? cart.length : 0}
            offset={[-5, 11]}
            showZero={true}
          >
            <NavLink className="nav-link" aria-current="page" to="/cart">
              CART
            </NavLink>
          </Badge>
        </li>

        <Search />

        {!auth?.user ? (
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">
                LOGIN
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/register">
                REGISTER
              </NavLink>
            </li>
          </>
        ) : (
          <div className="dropdown">
            <li>
              <a
                className="nav-link pointer dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                {auth?.user?.name?.toUpperCase()}
              </a>

              <ul className="dropdown-menu">
                <li>
                  <NavLink
                    className="nav-link"
                    to={`/dashboard/${
                      auth?.user?.role === 1 ? "admin" : "user"
                    }`}
                  >
                    Dashboard
                  </NavLink>
                </li>

                <li className="nav-item pointer">
                  <a onClick={logout} className="nav-link">
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </div>
        )}
      </ul>
    </>
  );
}*/
