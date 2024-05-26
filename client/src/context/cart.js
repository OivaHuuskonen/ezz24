import { useState, createContext, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    /* og koodi: let existingCart = localStorage.getItem("cart");
    if (existingCart) setCart(JSON.parse(existingCart));
  }, []); */

  const savedCart = JSON.parse(localStorage.getItem("cart"));
  if (savedCart) {
    setCart(savedCart);
  }
}, []);

  return (
    <CartContext.Provider value={[cart, setCart]}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};

/*const useCart = () => useContext(CartContext);
export { useCart, CartProvider };*/
