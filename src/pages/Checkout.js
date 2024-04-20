import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import {
  getUser,
  getImageUrl,
  getSingleImageUrl,
  addOrder,
} from "../services/firebaseActions";

import "./Checkout.css";
import namepage from "../assets/logobasket.png";
import arrow from "../assets/leftarrow.png";
import Ellipse from "../assets/ellipse.png";
import Ellipse1 from "../assets/ellipse01.png";
import QRcode from "../assets/qrcode.jpg";
import dress from "../assets/dress2.jpg";

export const Checkout = ({ merchantDetails, merchantProducts }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [imageSrc, setImageSrc] = useState("");

  const navigate = useNavigate();

  const calculateTotal = () => {
    const calculateItemSubtotal = (product, quantity) => {
      return product.productPrice * quantity;
    };

    return cart.reduce((total, cartItem) => {
      const productDetails = getProductDetails(cartItem.productId);

      if (productDetails) {
        return total + calculateItemSubtotal(productDetails, cartItem.quantity);
      } else {
        return total;
      }
    }, 0);
  };

  const getProductDetails = (productId) => {
    return products.find((product) => product.id === productId);
  };

  useEffect(() => {
    const userId = sessionStorage.uid;

    getUser(userId).then((data) => {
      const { cart } = data;

      setCart(cart);
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

          setProducts(updatedProducts);
        } catch (error) {
          // Handle errors
          console.error("Error updating products:", error);
        }
      }
    };

    fetchData(); // Invoke the asynchronous function immediately
  }, [merchantProducts]);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [gcashReferenceNumber, setGcashReferenceNumber] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    const userDetails = { name, email, address, contactNumber };
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
  };
  const handleNameChange = (e) => {
    setName(e.target.value);

    const userDetails = { name, email, address, contactNumber };
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
  };
  const handleAddressChange = (e) => {
    setAddress(e.target.value);

    const userDetails = { name, email, address, contactNumber };
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
  };
  const handleContactNumberChange = (e) => {
    setContactNumber(e.target.value);

    const userDetails = { name, email, address, contactNumber };
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
  };

  const submitOrder = (name, email, address, contactNumber) => {
    if (
      name.length === 0 ||
      email.length === 0 ||
      address.length === 0 ||
      contactNumber.length === 0
    ) {
      alert("Fill out all details.");
      return;
    }

    if (!cart) {
      return;
    }

    console.log(cart);
    const newItemDetails = cart.map((cartItem) => {
      const productDetails = getProductDetails(cartItem.productId);

      console.log(cartItem, productDetails);
      if (productDetails) {
        return {
          productId: cartItem.productId,
          productName: productDetails.productName,
          quantity: cartItem.quantity,
          totalPrice: productDetails.productPrice * cartItem.quantity,
        };
      } else {
        return null;
      }
    });

    const total = newItemDetails.reduce((total, item) => {
      console.log(item);
      return (total += item?.totalPrice);
    }, 0);

    // Create a new Date object
    const currentDate = new Date();

    // Get the individual components of the date
    const month = currentDate.getMonth() + 1; // Months are zero-based, so we add 1
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();

    // Format the date as MM/DD/YYYY
    const formattedDate = `${(month < 10 ? "0" : "") + month}/${
      (day < 10 ? "0" : "") + day
    }/${year}`;
    const newOrderDetails = {
      name,
      email,
      address,
      contactNumber,
      total,
      datePlaced: formattedDate,
      status: "Confirming Payment",
      items: newItemDetails,
    };

    const merchantId = merchantDetails.reference;
    const userId = sessionStorage.uid;

    console.log(newOrderDetails);

    addOrder(merchantId, userId, newOrderDetails).then((res) => {
      if (res) {
        const cartURL = "/stores/" + merchantDetails.pageLink;

        navigate(cartURL);
      }
    });
  };

  const mayaCheckout = () => {
    const baseUrl = "https://pg-sandbox.paymaya.com/checkout/v1/checkouts";
    const apiKey = "pk-Z0OSzLvIcOI2UIvDhdTGVVfRSSeiGStnceqwUE7n0Ah"; // **DEMO KEY - DO NOT USE IN PRODUCTION**
    const base64 = btoa(apiKey);

    const items = cart.map((product) => {
      const productDetails = getProductDetails(product.productId);

      return {
        name: productDetails.productName,
        quantity: product.quantity,
        amount: {
          value: Number(productDetails.productPrice).toFixed(2),
        },
        totalAmount: {
          value: Number(productDetails.productPrice * product.quantity).toFixed(
            2
          ),
        },
      };
    });

    const checkoutData = {
      totalAmount: {
        value: items
          .reduce((total, item) => total + Number(item.totalAmount.value), 0)
          .toFixed(2),
        currency: "PHP",
      },
      items,
      redirectUrl: {
        success: window.location.href + "?success=true",
        failure:
          "https://www.mechantsite.com/failure?id=5fc10b93-bdbd-4f31-b31d-4575a3785009",
        cancel:
          "https://www.merchantsite.com/cancel?id=5fc10b93-bdbd-4f31-b31d-4575a3785009",
      },
      requestReferenceNumber: "5fc10b93-bdbd-4f31-b31d-4575a3785009",
    };

    const options = {
      method: "POST",
      headers: {
        Authorization: `Basic ${base64}`, // Assuming Bearer token authentication for this example (not confirmed)
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    };

    fetch(baseUrl, options)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        window.location.href = data.redirectUrl;
      })
      .catch((error) => console.error("Error:", error));
  };

  let paymentSuccess = window.location.href.includes("?success=true");
  useEffect(() => {
    if (paymentSuccess && cart.length > 0 && products.length > 0) {
      const savedUserDetails = localStorage.getItem("userDetails");

      const { name, email, address, contactNumber } =
        JSON.parse(savedUserDetails);

      console.log(name, email, address, contactNumber);
      console.log(cart);

      submitOrder(name, email, address, contactNumber);
    }
  }, [paymentSuccess, cart, products]);

  return (
    <div /*className='container_navbar'*/>
      <div className="first_imge">
        <img className="ellipse" alt="Ellipse" src={Ellipse} />
        <img className="ellipse_01" alt="Ellipse" src={Ellipse1} />
      </div>

      <header>
        <div className="back-button">
          <img className="bow" alt="" src={arrow} />
          <Link
            to={
              window.location.href.slice(
                0,
                window.location.href.indexOf("/Checkout")
              ) + "/Cart"
            }
          >
            <div>Back to Cart</div>
          </Link>
        </div>
        <div className="logo">
          <p>Basketbliss</p>
          <img className="logo_page" alt="" src={namepage} />
        </div>
      </header>

      <section className="title-checkout">
        <h1>Checkout</h1>
      </section>

      <section className="checkout-container">
        <div className="shipping_details-container">
          <div className="header-shipping_details">
            <div>Shipping Details</div>
            <span />
          </div>
          <div className="shipping-inputs">
            <input
              type="text"
              placeholder="EMAIL*"
              value={email}
              onChange={handleEmailChange}
            />
            <input
              type="text"
              placeholder="FULL NAME*"
              value={name}
              onChange={handleNameChange}
            />
            <input
              type="text"
              placeholder="ADDRESS*"
              value={address}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              placeholder="CONTACT NUMBER*"
              value={contactNumber}
              onChange={handleContactNumberChange}
            />
            {/* <input type='text' placeholder='GCASH REFERENCE NUMBER*' value={gcashReferenceNumber} onChange={handleGcashReferenceNumberChange}/> */}
          </div>
          {/* <div className='payment_details-container'>
            <img src={imageSrc}/>
          </div> */}
        </div>
        <div className="order_details">
          <h3>YOUR ORDER</h3>
          <span></span>
          <div className="orders">
            {cart.map((cartItem) => {
              const productDetails = getProductDetails(cartItem.productId);

              if (productDetails) {
                return (
                  <div className="order" key={cartItem.productId}>
                    <div className="order-left">
                      <img
                        src={productDetails.pictures[0]}
                        alt={productDetails.name}
                      />
                      <div className="order-qty">
                        <p>{productDetails.productName}</p>
                        <p>Qty: {cartItem.quantity}</p>
                      </div>
                    </div>
                    <div className="price">
                      <p>₱ {productDetails.productPrice * cartItem.quantity}</p>
                    </div>
                  </div>
                );
              } else {
                return null; // Handle the case where product details are not found
              }
            })}
            {/* <div className='order'>
              <div className='order-left'>
                <img src={dress}/>
                <div className='order-qty'>
                  <p>Apron Dress</p>
                  <p>Qty: 1</p>
                </div>
              </div>
              <div className='price'><p>₱ 300</p></div>
            </div>
            <div className='order'>
              <div className='order-left'>
                <img src={dress}/>
                <div className='order-qty'>
                  <p>Apron Dress</p>
                  <p>Qty: 1</p>
                </div>
              </div>
              <div className='price'><p>₱ 300</p></div>
            </div> */}
            <div className="total-container">
              <div className="total">
                <div>TOTAL</div>
              </div>
              <div className="total">
                <div>₱ {calculateTotal()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="purchase-container">
        <div className="purchase-button" onClick={mayaCheckout}>
          <p>PURCHASE</p>
        </div>
      </section>
    </div>
  );
};
export default Checkout;
