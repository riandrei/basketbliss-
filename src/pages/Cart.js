import "./Cart.css";

import { useState } from "react";
import { Link } from "react-router-dom";

import namepage from "../assets/logobasket.png";
import arrow from "../assets/leftarrow.png";
import Ellipse from "../assets/ellipse.png";
import Ellipse1 from "../assets/ellipse01.png";
import dress01 from "../assets/dress1.jpg";
import { useEffect } from "react";
import {
  editProductQuantityInCart,
  getUser,
  getImageUrl,
  removeProductFromCart,
} from "../services/firebaseActions";

const Cart = ({ merchantProducts }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const userId = sessionStorage.uid;

    getUser(userId).then((data) => {
      const { cart } = data;

      console.log(cart);

      const newCart = cart.map((cartItem) => {
        const product = merchantProducts.find(
          (product) => product.id === cartItem.productId
        );

        return {
          productId: cartItem.productId,
          productName: product.productName,
          productQuantity: cartItem.quantity,
          productAmount: product.productPrice,
        };
      });

      setCart(newCart);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (merchantProducts) {
        try {
          const updatedProducts = await Promise.all(
            merchantProducts.map(async (merchantProduct) => {
              if (merchantProduct) {
                const urls = await getImageUrl(merchantProduct);
                merchantProduct.pictures = urls;
                return merchantProduct;
              }
            })
          );

          console.log(updatedProducts);

          setProducts(updatedProducts);
        } catch (error) {
          // Handle errors
          console.error("Error updating products:", error);
        }
      }
    };

    fetchData(); // Invoke the asynchronous function immediately
  }, [merchantProducts]);

  const submitDeleteProduct = (product) => {
    const userId = sessionStorage.uid;

    removeProductFromCart(userId, product.id);
  };

  const handleQuantityChange = (e) => {
    editProductQuantityInCart(e.target.value);
  };

  useEffect(() => console.log(cart), [cart]);
  return (
    <div className="container">
      <div>
        <h1 className="cart-heading">My Shopping Cart</h1>
      </div>
      {cart.map((product) => (
        <div className="cart-item">
          <div className="cart-item-row">
            <h2 className="cart-item-text">{product.productName}</h2>
            <h2 className="cart-item-text">x{product.productQuantity}</h2>
            <h2 className="cart-item-text">P{product.productAmount}</h2>
            <button onClick={submitDeleteProduct} className="remove-button">
              Remove
            </button>
          </div>
        </div>
      ))}
      <Link
        to={
          window.location.href.slice(0, window.location.href.indexOf("/Cart")) +
          "/Checkout"
        }
      >
        <button className="check">Checkout</button>
      </Link>
    </div>
  );
};

export default Cart;
