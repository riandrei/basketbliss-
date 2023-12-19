import React, { useEffect, useState } from 'react';

import { addMerchantProduct } from '../services/firebaseActions';
import Nav from '../components/Nav'

import './AddItem.css';
import Dress1 from '../assets/dress1.jpg';
import Footer from '../components/Footer';


function AddItem({setCertainState, merchantDetails}) {
  const [variations, setVariations] = useState([]);
  const [productName, setProductName] = useState('')
  const [productStock, setProductStock] = useState(0)
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState(0)
  const [pictures, setPictures] = useState([])



  const addVariation = () => {
    setVariations([...variations, { id: variations.length + 1, value: '' }]);
  };

  const addProduct = () => {
    const merchantId = sessionStorage.uid
    
    if(merchantDetails.merchantQrCode === undefined) {
      alert('Submit QR First')
    }
    
    addMerchantProduct({productName, productStock, productDescription, productPrice, variations, pictures: []}, pictures, merchantId).then((res) => {
      if(res) {
        setProductName('')
        setProductDescription('')
        setProductStock(0)
        setVariations([])
        setPictures([])
        setProductPrice(0)
      }
      return;
    })
  }

  const removeVariation = (id) => {
    const updatedVariations = variations.filter((variation) => variation.id !== id);
    setVariations(updatedVariations);
  };

  const handleProductNameChange = (e) => {
    setProductName(e.target.value)
  }
  const handleProductStockChange = (e) => {
    setProductStock(e.target.value)
  }
  const handleProductDescriptionChange = (e) => {
    setProductDescription(e.target.value)
  }
  const handlePicturesChange = (e) => {
    setPictures(e.target.files)
  }
  const handleProductPriceChange = (e) => {
    setProductPrice(e.target.value)
  }

  return (
    <div className="additem">
      <h1>ADMIN PANEL</h1>
      <Nav setCertainState={setCertainState} merchantDetails={merchantDetails}/>
      <div className="main-container">
        <div className="additem-left">
          <h2>Post a Product:</h2>
          <div className="name-stocks">
            <div className="detail-container">
              <label>Product name:</label>
              <input type="text" value={productName} onChange={handleProductNameChange}/>
            </div>
            <div className="detail-container">
              <label>Product stock:</label>
              <input type="number" value={productStock} onChange={handleProductStockChange}/>
            </div>
            <div className="detail-container">
              <label>Product price:</label>
              <input type="number" value={productPrice} onChange={handleProductPriceChange}/>
            </div>
          </div>
          <div className="texarea-container">
            <div className="textarea">
              <label>Product Description:</label>
              <textarea value={productDescription} onChange={handleProductDescriptionChange}></textarea>
            </div>
          </div>
          <div className="input-images">
            <h3>Insert images(Insert at least 1 picture 4 max)</h3>
            <input type="file" accept="image/*" onChange={handlePicturesChange} multiple/>
          </div>
          <button className="addProduct" onClick={addProduct}>Add product</button>
        </div>
      </div>
    </div>
  );
}

export default AddItem;
