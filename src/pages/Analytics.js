import React, { useEffect, useState } from "react";
import "./Analytics.css";

import Nav from "../components/Nav";
import ViewOrder from "./ViewOrder";

import Dashboard from "../assets/dashboard.png";
import Order from "../assets/order-delivery.png";
import Customer from "../assets/customer.png";
import Profit from "../assets/profit.png";
import {
  getMerchantDetails,
  editOrderStatus,
  cancelUserOrder,
} from "../services/firebaseActions";

function Analytics({
  setCertainState,
  merchantProducts,
  merchantDetails,
  totalOrders,
}) {
  const [orders, setOrders] = useState([]);
  const [reload, setReload] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const setSelect = () => {
    setSelectedOrder(null);
  };

  const viewComponent = () => {
    console.log(merchantProducts);
    return selectedOrder ? (
      <ViewOrder
        merchantProducts={merchantProducts}
        setSelect={setSelect}
        order={selectedOrder}
      />
    ) : null;
  };

  const cancelOrder = (orderId, userId) => {
    const merchantId = sessionStorage.uid;
    cancelUserOrder(orderId, merchantId, userId).then((cancelled) => {
      if (cancelled) {
        setReload(true);
      }
    });
  };

  const handleStatusChange = (e, orderId, userId) => {
    const newStatus = e.target.value;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.orderId === orderId) {
          return { ...order, status: newStatus };
        } else {
          return order;
        }
      })
    );

    const merchantId = sessionStorage.uid;

    editOrderStatus(orderId, newStatus, userId, merchantId).then((res) => {
      if (res) {
        setReload(true);
      }
    });
  };

  useEffect(() => {
    const merchantId = sessionStorage.uid;

    getMerchantDetails(merchantId).then((data) => {
      setOrders(data.orders);
    });
  }, [reload]);

  useEffect(() => setReload(false), []);

  return (
    <div className="Analytics">
      <Nav
        setCertainState={setCertainState}
        merchantDetails={merchantDetails}
      />
      <h1>Admin Dashboard</h1>
      <div className="analytics-container">
        <div className="analytics-details">
          <div className="analytics-details-top">
            <p>Total Page Views</p> <img src={Dashboard} />
          </div>
          <p className="analytics-value">{merchantDetails.merchantPageViews}</p>
        </div>

        <div className="analytics-details">
          <div className="analytics-details-top">
            <p>Total Customers</p> <img src={Customer} />
          </div>
          <p className="analytics-value">{merchantDetails.merchantUsers}</p>
        </div>

        <div className="analytics-details">
          <div className="analytics-details-top">
            <p>Total Orders</p> <img src={Order} />
          </div>
          <p className="analytics-value">{totalOrders}</p>
        </div>

        {/* <div className="analytics-details">
          <div className="analytics-details-top">
            <p>Expected Earning</p>  <img src={ Profit }/>
          </div>
          <p className='analytics-value'>420</p>
        </div>

        <div className="analytics-details">
          <div className="analytics-details-top">
            <p>Expected Earning</p>  <img src={ Profit }/>
          </div>
          <p className='analytics-value'>420</p>
        </div> */}
      </div>

      <div className="orders">
        <h2>Orders</h2>
        <table>
          <tr>
            <th>Order ID</th>
            <th>Order Owner</th>
            <th>Price</th>
            <th>Expected Delivery</th>
            <th>Status</th>
            <th></th>
          </tr>
          {orders ? (
            orders.map((order) => (
              <tr>
                <td
                  onClick={() => setSelectedOrder(order)}
                  className="order-id"
                >
                  {order.id?.split("_")[0] + "..."}
                </td>
                <td>{order.name}</td>
                <td>P{order.total}</td>
                <td>{order.datePlaced}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(e, order.id, order.userId)
                    }
                  >
                    <option value="Confirming Payment">
                      Confirming Payment
                    </option>
                    <option value="Order Paid">Order Paid</option>
                    <option value="Order Packing">Order Packing</option>
                    <option value="Order Shipped">Order Shipped</option>
                    {/* <option value='Received'>Received</option> */}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => {
                      cancelOrder(order.id, order.userId);
                    }}
                    className="delete-order"
                  >
                    Cancel Order
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <div>No Orders</div>
          )}
        </table>
      </div>

      {viewComponent()}
    </div>
  );
}

export default Analytics;
