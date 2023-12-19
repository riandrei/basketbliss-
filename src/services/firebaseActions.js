import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, arrayRemove, arrayUnion} from "firebase/firestore"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

const db = getFirestore();
const auth = getAuth()
const storage = getStorage()

export const signUpMerchantWithEmailAndPassword = (email, password) => {
  const tempEmail = email.split('@')
  const merchantEmail = tempEmail[0] + '-merchant@' + tempEmail[1]
	
	return createUserWithEmailAndPassword(auth, merchantEmail, password).then((userCredential) => {
    // Signed up
    const user = userCredential.user;
    
    setDoc(doc(db, "merchants", user.uid), {
      merchantDetails: {
        name: tempEmail[0],
        number: '',
        email: '',
        tagline: '',
        address: '',
        pageLink: tempEmail[0],
        facebookLink: '',
        tiktokLink: '',
        instagramLink: '',
        reference: tempEmail[0],
        pageViews: 0,
        users: 0,
      },
      orders: []
    })

    return {uid: user.uid}
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message.split('').splice(0, 15).join('');
    
    return {errorCode};
  });
}

export const logInMerchantWithEmailAndPassword = (email, password) => {
  const tempEmail = email.split('@')
  const merchantEmail = tempEmail[0] + '-merchant@' + tempEmail[1]

  console.log(merchantEmail)
  
  return signInWithEmailAndPassword(auth, merchantEmail, password).then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    
    return {uid: user.uid}
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    console.log(errorCode, errorMessage);
    return errorCode;
  });
}

export const signUpUserWithEmailAndPassword = (email, password, merchantName) => {
  const tempEmail = email.split('@')
  const merchantEmail = tempEmail[0] + `-${merchantName}@` + tempEmail[1]

  console.log('run');
	
	return createUserWithEmailAndPassword(auth, merchantEmail, password).then((userCredential) => {
    // Signed up
    const user = userCredential.user;
    
    setDoc(doc(db, "users", user.uid), {
      userDetails: {
        name: tempEmail[0],
        number: '',
        email: '',
        address: '',
      },
      id: user.uid
    })

    return {uid: user.uid}
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message.split('').splice(0, 15).join('');
    
    return {errorCode};
  });
}

export const logInUserWithEmailAndPassword = (email, password, merchantName) => {
  const tempEmail = email.split('@')
  const merchantEmail = tempEmail[0] + `-${merchantName}@` + tempEmail[1]

  console.log(merchantEmail)
  
  return signInWithEmailAndPassword(auth, merchantEmail, password).then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    
    return {uid: user.uid}
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    console.log(errorCode, errorMessage);
    return errorCode;
  });
}

export const signOutUser = () => {
  console.log('signout')

  return signOut(auth).then(() => {
    return true;
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    console.log(errorCode, errorMessage);
    return false;
  })
}
export const updateMerchantDetails = async (merchantDetails, merchantId) => {
  const merchantRef = doc(db, "merchants", merchantId)

  console.log(merchantDetails.qrCode);
  console.log(typeof merchantDetails.qrCode)

  if(typeof merchantDetails.qrCode != 'string') {
    const randomName = generateRandomFileName() + '.png'; // Assuming you have a function to generate a random file name

    const storageRef = ref(storage, `/files/${randomName}`);
    const res = await uploadBytesResumable(storageRef, merchantDetails.qrCode);
    
    // Get the download URL
    const downloadURL = res.ref.fullPath
    
    merchantDetails.qrCode = downloadURL;
  }

  return updateDoc(merchantRef, {merchantDetails: merchantDetails}).then((payload) => {
    console.log(payload)
    return true;
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message
    return false;
  })
}

export const getMerchantDetails = (merchantId) => {
  const docRef = doc(db, "merchants", merchantId);
  
  return getDoc(docRef).then(payload => {
    // console.log(payload.data())
    if(!payload._document) {
      return null
    }

    const data = payload.data()

    return data;
  })
}

export const getAllMerchants = () => {
  const collectionRef = collection(db, "merchants");

  return getDocs(collectionRef).then(payload => {
    return payload
  })
}

const generateRandomFileName = () => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2);
  return `${timestamp}_${randomString}`;
};

export const addMerchantProduct = async (product, pictures, merchantId) => {
  const merchantRef = doc(db, "merchants", merchantId);

  try {
    // Use Promise.all to wait for all asynchronous operations to complete
    const picturePaths = await Promise.all(Array.from(pictures).map(async (picture) => {
      const randomName = generateRandomFileName() + '.png';

      const storageRef = ref(storage, `/files/${randomName}`);
      const res = await uploadBytesResumable(storageRef, picture);
      return res.ref.fullPath;
    }));

    // Retrieve existing products
    const merchantData = await getMerchantDetails(merchantId)
    const existingProducts = merchantData.products;

    let updatedProducts = []
    
    if(!existingProducts) {
      console.log(`hello`)
      updatedProducts = [{...product, pictures: picturePaths, id: generateRandomFileName()}]
    } else {
      // Add the new product and pictures to the existing products
      updatedProducts = [...existingProducts, { ...product, pictures: picturePaths, id: generateRandomFileName() }];
    }

    // Update the Firestore document with the updated products array
    const updatedData = { products: updatedProducts };
    await updateDoc(merchantRef, updatedData);

    console.log('Product added successfully');
    return true;
  } catch (error) {
    console.error('Error adding product:', error.message);
    return false;
  }
};

export const getImageUrl = async (product) => {

  const downloadPromises = await Promise.all(product.pictures.map(async (picture) => {
    const imageRef = ref(storage, picture);
    const res = await getDownloadURL(imageRef)
    return res
  })
  )
  
  return downloadPromises
}

export const getSingleImageUrl = async (picture) => {
  const imageRef = ref(storage, picture);
  const res = await getDownloadURL(imageRef)

  return res
}

export const addToCart = async (userId, productId, quantity) => {
  const userRef = doc(db, "users", userId);

  try {
    // Get the user's current cart data
    const userDoc = await getDoc(userRef);
    const currentCart = userDoc.data()?.cart || [];

    // Check if the product is already in the cart
    const existingProductIndex = currentCart.findIndex((item) => item.productId === productId);

    if (existingProductIndex !== -1) {
      // If the product is already in the cart, update the quantity
      currentCart[existingProductIndex].quantity += quantity;
    } else {
      // If the product is not in the cart, add it
      currentCart.push({ productId, quantity });
    }

    // Update the user's cart in Firestore
    await updateDoc(userRef, { cart: currentCart });

    console.log('Product added to cart successfully');
    return true;
  } catch (error) {
    console.error('Error adding product to cart:', error.message);
    return false;
  }
};

export const clearCart = async(userId) => {
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, { cart: [] });

  return true;
}

export const addPageVisits = async (merchantReference) => {
  if(!merchantReference) {
    return;
  }
  const merchantsCollection = collection(db, 'merchants');
  const q = query(merchantsCollection, where('merchantDetails.reference', '==', merchantReference));

  try {
    const querySnapshot = await getDocs(q);

    console.log(querySnapshot.length)
    
    querySnapshot.forEach(async (resDoc) => {
      const merchantData = resDoc.data();

      console.log(resDoc)

      const updatedPageViews = (merchantData.merchantDetails.pageViews || 0) + 1;
      const updatedMerchantDetails = {...merchantData.merchantDetails, pageViews: updatedPageViews}
      const merchantId = resDoc.id; 
        const updateResult = await updateMerchantDetails(updatedMerchantDetails, merchantId);

        if (updateResult) {
          console.log('Merchant details updated successfully.');
          return true;
        } else {
          console.log('Failed to update merchant details.');
          return false;
        }
    });
  } catch (error) {
    console.error('Error getting merchants by reference:', error);
  }
}

export const addTotalUser = async (merchantReference) => {
  if(!merchantReference) {
    return;
  }
  const merchantsCollection = collection(db, 'merchants');
  const q = query(merchantsCollection, where('merchantDetails.reference', '==', merchantReference));

  try {
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(async (resDoc) => {
      const merchantData = resDoc.data();

      const updatedUsers = (merchantData.merchantDetails.users || 0) + 1;
      const updatedMerchantDetails = {...merchantData.merchantDetails, users: updatedUsers}
      const merchantId = resDoc.id; 
        const updateResult = await updateMerchantDetails(updatedMerchantDetails, merchantId);

        if (updateResult) {
          console.log('Merchant details updated successfully.');
          return true;
        } else {
          console.log('Failed to update merchant details.');
          return false;
        }
    });
  } catch (error) {
    console.error('Error getting merchants by reference:', error);
  }
}

export const cancelUserOrder = async (orderId, merchantId, userId) => {
  console.log(merchantId);
  const merchantRef = doc(db, "merchants", merchantId);
  const userRef = doc(db, 'users', userId)

  try {
    // Fetch the current orders array
    const merchantDoc = await getDoc(merchantRef);
    const ordersArray = merchantDoc.data().orders || [];

    const userDoc = await getDoc(userRef)
    const userOrdersArray = userDoc.data().orders || [];

    // Find the index of the order with the matching orderId
    const orderIndex = ordersArray.findIndex(order => order.id === orderId);
    const userOrderIndex = userOrdersArray.findIndex(order => order.id === orderId)

    if (orderIndex !== -1) {
      // Use arrayRemove with the actual value to remove
      const payload = await updateDoc(merchantRef, {
        orders: arrayRemove(ordersArray[orderIndex])
      });

      if(userDoc.exists()) {
        const updatedUserOrders = merchantDoc.data().orders.map(order => {
          if (order.id === orderId) {
            return { ...order, status: 'Order Cancelled' };
          } else {
            return order;
          }
        });

        await updateDoc(userRef, {orders: updatedUserOrders})
      }

      console.log('Order canceled successfully:', orderId);
      return true;
    } else {
      console.error('Order not found for cancellation:', orderId);
      return false;
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error('Error canceling order:', errorCode, errorMessage);
    return false;
  }
};


export const editOrderStatus = async (orderId, orderStatus, userId, merchantId) => {
  const merchantRef = doc(db, 'merchants', merchantId);
  const userRef = doc(db, 'users', userId)

  console.log(orderStatus);

  try {
    // Get the merchant document
    const merchantDoc = await getDoc(merchantRef);
    const userDoc = await getDoc(userRef)
    
    if (merchantDoc.exists()) {
      // Update the order status in the orders array
      const updatedOrders = merchantDoc.data().orders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: orderStatus };
        } else {
          return order;
        }
      });

      if(userDoc.exists()) {
        const updatedUserOrders = merchantDoc.data().orders.map(order => {
          if (order.id === orderId) {
            return { ...order, status: orderStatus };
          } else {
            return order;
          }
        });

        await updateDoc(userRef, {orders: updatedOrders})
      }

      // Update the merchant document with the modified orders array
      await updateDoc(merchantRef, { orders: updatedOrders });
      console.log('Order status updated successfully');
      return true;
    } else {
      console.log('Merchant document not found');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

export const getUser = (userId) => {
  const docRef = doc(db, "users", userId);
  
  return getDoc(docRef).then(payload => {
    // console.log(payload.data())
    if(!payload._document) {
      return null
    }

    const data = payload.data()

    console.log(data);

    return data;
  })
}

export const addOrder = async (merchantReference, userId, orderDetails) => {
  if (!merchantReference || !userId || !orderDetails) {
    console.log(merchantReference, userId,orderDetails)

    return false;
  }

  console.log(merchantReference);

  const merchantsCollection = collection(db, 'merchants');

  try {
    // Find the merchant based on reference
    const merchantQuery = query(merchantsCollection, where('merchantDetails.reference', '==', merchantReference));
    const merchantSnapshot = await getDocs(merchantQuery);

    console.log(merchantSnapshot.docs);

    if (!merchantSnapshot.empty) {
      const merchantDoc = merchantSnapshot.docs[0];

      const id = generateRandomFileName()
        
      const modifiedOrderDetails = {...orderDetails, id, userId}

      const merchantProducts = merchantDoc.data().products

      console.log(merchantProducts);

      const newMerchantProducts = merchantProducts.map((merchantProduct) => {
        const matchingItem = modifiedOrderDetails.items.find(item => item.productId === merchantProduct.id);
      
        if (matchingItem) {
          if(merchantProduct.productStock < matchingItem.quantity) {
            return 'invalid'
          }
          const newProduct = { ...merchantProduct, productStock: merchantProduct.productStock - matchingItem.quantity };
          console.log(newProduct);
          return newProduct;
        }
      
        // If no matching item is found, return the original product
        return merchantProduct;
      });

      if(newMerchantProducts[0] === 'invalid') {
        console.log('unsuccessful')
        return 'unsuccessful'
      }

      // Update merchant's order history
      const updatedMerchantOrders = arrayUnion(modifiedOrderDetails);
      await updateDoc(merchantDoc.ref, { orders: updatedMerchantOrders, products: newMerchantProducts });

      console.log('Merchant order history updated successfully.');

      // Find the user based on userId
      const userRef = doc(db, "users", userId);



        const updatedUserOrders = arrayUnion(modifiedOrderDetails);
        await updateDoc(userRef, { orders: updatedUserOrders });

        console.log('User order history updated successfully.');

        await updateDoc(userRef, { cart: [] });

        console.log('Cart cleared successfully after checkout');

        return true;
    } else {
      console.log('Merchant not found.');
      return false;
    }
  } catch (error) {
    console.error('Error adding order:', error);
    return false;
  }
};

export const editProduct = async (productId, newProduct, merchantId) => {
  const merchantRef = doc(db, 'merchants', merchantId);

  try {
    // Get the merchant document
    const merchantDoc = await getDoc(merchantRef);

    if (merchantDoc.exists()) {
      // Update the product details in the products array
      const updatedProducts = merchantDoc.data().products.map(product => {
        if (product.id === productId) {
          return { ...newProduct };
        } else {
          return product;
        }
      });

      console.log(updatedProducts);

      // Update the merchant document with the modified products array
      await updateDoc(merchantRef, { products: updatedProducts });
      console.log('Product updated successfully');
      return true;
    } else {
      console.log('Merchant document not found');
    }
  } catch (error) {
    console.error('Error updating product:', error);
  }
};


export const deleteProduct = async (productId, merchantId) => {
  const merchantRef = doc(db, 'merchants', merchantId);

  try {
    // Get the merchant document
    const merchantDoc = await getDoc(merchantRef);

    if (merchantDoc.exists()) {
      // Filter out the product to be deleted from the products array
      const updatedProducts = merchantDoc.data().products.filter(product => {
        return product.id !== productId;
      });

      // Update the merchant document with the modified products array
      await updateDoc(merchantRef, { products: updatedProducts });
      console.log('Product deleted successfully');
      return true;
    } else {
      console.log('Merchant document not found');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

export const removeProductFromCart = async (userId, productId) => {
  try {
    const user = await getUser(userId);

    if (!user || !user.cart) {
      // User or cart not found
      return false;
    }

    const updatedCart = user.cart.filter(item => item.productId !== productId);

    // Update the user document with the modified cart
    await updateDoc(doc(db, 'users', userId), { cart: updatedCart });

    return true;
  } catch (error) {
    console.error('Error removing product from cart:', error);
    throw error;
  }
};

export const editProductQuantityInCart = async (userId, productId, newQuantity) => {
  try {
    const user = await getUser(userId);

    if (!user || !user.cart) {
      // User or cart not found
      return false;
    }

    const updatedCart = user.cart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    // Update the user document with the modified cart
    await updateDoc(doc(db, 'users', userId), { cart: updatedCart });

    return true;
  } catch (error) {
    console.error('Error editing product quantity in cart:', error);
    throw error;
  }
};

onAuthStateChanged(auth, (user) => {
  if(user) {
    sessionStorage.setItem("uid", user.uid)
  } else {
    sessionStorage.clear()
  }
})

