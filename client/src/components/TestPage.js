import React from "react";
import ProductCardHorizontal from "./cards/ProductCardHorizontal";
import { CartProvider } from "../context/cart";

const mockProduct = {
  _id: "12345",
  name: "Test Product",
  price: 100,
  description: "Test product description",
  createdAt: new Date(),
};

function TestComponent() {
  return (
    <CartProvider>
      <ProductCardHorizontal p={mockProduct} remove={true} />
    </CartProvider>
  );
}

export default TestComponent;
