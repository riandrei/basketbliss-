import './Cart.css'

import {useState} from 'react'
import { Link } from 'react-router-dom'

import namepage from '../assets/logobasket.png'
import arrow from '../assets/leftarrow.png'
import Ellipse from '../assets/ellipse.png'
import Ellipse1 from '../assets/ellipse01.png'
import dress01 from '../assets/dress1.jpg'
import { useEffect } from 'react'
import { editProductQuantityInCart, getUser, removeProductFromCart } from '../services/firebaseActions'

const Cart = ({merchantProducts}) => {
  const [cart, setCart] = useState([])

    useEffect(() => {
      const userId = sessionStorage.uid;

      getUser(userId).then(data => {
        const {cart} = data
        
        setCart(cart)
      })
    }, [])

    const submitDeleteProduct = (product) => {
      const userId = sessionStorage.uid

      removeProductFromCart(product)
    }

    const handleQuantityChange = (e) => {
      editProductQuantityInCart(e.target.value)
    }

    useEffect(() => console.log(cart), [cart])
    return (
        <header className='container_navbar'>
        <div className="first_imge">
          <img className="ellipse" alt="Ellipse" src={Ellipse} />
          <img className="ellipse_01" alt="Ellipse" src={Ellipse1} />
        </div>
          <div className='bow_shoppe'>
            <img className='bow' alt='' src={arrow}/>
            <Link to={window.location.href.slice(0, window.location.href.indexOf('/Cart'))}>
            <p>Continue Shopping</p>
            </Link>
            <div className='basket_fix'>
              <p>Basketbliss</p>
              <img className='logo_page' alt='' src={namepage}/>
            </div>
          </div>
  
  {/*Cart*/}
        <div className='cart_fix'>
          <div className='cart_page'>
            <h1>My Cart</h1>
          </div>
        </div>
  {/*Pricing*/}
        <div className='pricing'>
            <h3>Price</h3>
            <h3>Quality</h3>
            <h3>Total</h3>  
        </div>
  
  {/* Horizontal */}  
       <hr className='line_horizontal'></hr>
  
  {/* Dressing */}
      <div className='cart_needs'>
        <img  alt='' src={dress01} />
        <div className='type_dress'>
        <h3 className='name_dress'>Apron Dress</h3>
        <h3 className='color_size'>Color: White</h3>
        <h3 className='color_size'>Size: Small</h3>
        </div>
        <div className='price_cart'>
            <h3>₱ 300</h3>
            <h3>1</h3>
            <h3>₱ 300</h3>  
        </div>
      </div>
  
  {/* cart two */}
  <div className='cart_needs_two'>
        <img  alt='' src={dress01} />
        <div className='type_dress'>
        <h3 className='name_dress'>Apron Dress</h3>
        <h3 className='color_size'>Color: White</h3>
        <h3 className='color_size'>Size: Small</h3>
        </div>
        <div className='price_cart_two'>
            <h3>₱ 300</h3>
            <h3>1</h3>
            <h3>₱ 300</h3>  
        </div>
      </div>
  
    <div className='subtotal'>
      <p>Subtotal</p>
      <p className='change_color'>₱ 600</p>
  </div>
  
      <div className='check_out_btn'>
      <Link to="/Checkout">
        <p>Checkout</p>
        </Link>
      </div>
  
  {/* Horizontal */}  
  <hr className='line_horizontal_two'></hr>
  
  {/* cart third */}
  <div className='cart_needs_third'>
        <img  alt='' src={dress01} />
        <div className='type_dress'>
        <h3 className='name_dress'>Apron Dress</h3>
        <h3 className='color_size'>Color: White</h3>
        <h3 className='color_size'>Size: Small</h3>
        </div>
        <div className='price_cart_third'>
            <h3>₱ 300</h3>
            <h3>1</h3>
            <h3>₱ 300</h3>  
        </div>
      </div>
  
  {/* Horizontal */}  
  <hr className='line_horizontal_third'></hr>
  
  
      <div className='check_out_btn_two'>
        <Link to={window.location.href.slice(0, window.location.href.indexOf('/Cart')) + '/Checkout'}>
        <p>Checkout</p>
        </Link>
      </div>
  
    </header>
  
    )
}

export default Cart;