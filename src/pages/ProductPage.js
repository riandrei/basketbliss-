import {useState, useEffect} from 'react';
import './ProductPage.css';

import { addToCart, clearCart, getImageUrl } from '../services/firebaseActions';

import dress1 from '../assets/dress1.jpg';
import cart2 from '../assets/cart2.png';
import checkout from '../assets/payment-method.png'
import { useNavigate } from 'react-router-dom';

function ProductPage({merchantName, product}) {
  const [price, setPrice] = useState(100)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariety, setSelectedVariety] = useState('small')
  const [productURLs, setProductURLs] = useState([])
  const [buy, setBuy] = useState(false)

  const navigate = useNavigate()

  const handleQuantityValueChange = (e) => {
    console.log(quantity)
    setQuantity(e.target.value)
  }

  const handleSelectedVarietyChange = (e) => {
    setSelectedVariety(e.target.value)
  }

  const addItemToCart = async () => {
    if(!sessionStorage.uid) {
      alert('You need to login first.')
      return;
    }

    if(product.productStock < 1) {
      alert('No stock available');

      return;
    }

    product.productStock -= 1;

    const userId = sessionStorage.uid
    const productId = product.id
    const quantity = 1

    // Use await to wait for the addToCart promise to resolve
    await addToCart(userId, productId, quantity);

    alert('Added to Cart Successfully');
    return true;
  }

  const buyItemNow = async () => {
    if(!sessionStorage.uid) {
      alert('You need to login first.')
      return;
    }

    if(product.productStock < 1) {
      alert('No stock available');

      return;
    }

    const userId = sessionStorage.uid

    setBuy(true)

    const cleared = await clearCart(userId);

    console.log('test');

    if (cleared) {
      // Use await to wait for the addItemToCart promise to resolve
      const added = await addItemToCart();

      if (added) {
        navigate('/stores/' + merchantName + '/Checkout');
        return;
      }
    }
  }

  const merchantSplit = merchantName.split('').reverse()

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls = await getImageUrl(product);
      setProductURLs(urls);
    };
  
    fetchImageUrls();
  }, [product]);
  
  return (
    <div className="ProductPage">
      <div className="product-page-container">
      <div className="companyName">
        {
        merchantSplit.map(merchantLetter => (
          <span>{merchantLetter}</span>
        ))
        }
        </div>

        <div className="product-page-descriptions">
          <h2 className="latest">{merchantName}</h2>
          <h1>Your <span>Shop</span>, Your <span>Rules</span>:</h1>
          <p>{product.productDescription}</p>
          <div className="product-page-descriptions-button">
            <button onClick={addItemToCart}><img src={ cart2 }/>  Add to Cart</button>
            <button onClick={buyItemNow}><img src={ checkout }/>  Buy Now</button>
          </div>
        </div>

        <div className="product-page-mainpic">
          <img src={productURLs[0] || dress1} />
        </div>
        
        <div className="product-page-subpics">
          {
            productURLs.map(picture => (
              <img src={picture}/>
            ))
          }
        </div>

        <div className="product-page-price">
          {/* <div className="sizes-container">
            <label className='sizes-label' for="sizes">Sizes: </label>
            <div className="variation-sizes">
              <div className="product-size">
                <input type="radio" name="sizes" />
                <label >Small</label>
                
              </div>

              <div className="product-size">
                <input type="radio" name="sizes" />
                <label >Medium</label>
                
              </div>

              <div className="product-size">
                <input type="radio" name="sizes" />
                <label >Large</label>
                
              </div>
            </div>
          </div> */}
          <div className="price-container">
          <label className='sizes-label' for="sizes">Product Price: </label>
            <p>₱{product.productPrice}</p>
          </div>

          <div className="price-container">
          <label className='sizes-label' for="sizes">Product stocks:</label>
            <p>{product.productStock}</p>
          </div>

        </div>

      </div>
      <div>

      </div>
    </div>
  )
}

export default ProductPage