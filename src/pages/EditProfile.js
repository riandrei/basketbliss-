import {useEffect, useState} from 'react';
import './EditProfile.css';

import { getSingleImageUrl, getMerchantDetails, updateMerchantDetails } from '../services/firebaseActions';
import Nav from '../components/Nav';
import {Link, useNavigate} from 'react-router-dom';

import plant from '../assets/plant.svg'
import plant2 from '../assets/plant2.svg'

function EditProfile({merchantDetails, setCertainState}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [image, setImage] = useState(null)

  const navigate = useNavigate()
  const handleMerchantNameChange = (e) => {
    setCertainState('MerchantName', e.target.value)
  }
  const handleMerchantTaglineChange = (e) => {
    setCertainState('MerchantTagline', e.target.value)
  }
  const handleMerchantNumberChange = (e) => {
    setCertainState('MerchantNumber', e.target.value)
  }
  const handleMerchantEmailChange = (e) => {
    setCertainState('MerchantEmail', e.target.value)
  }
  const handleMerchantFacebookLinkChange = (e) => {
    setCertainState('MerchantFacebookLink', e.target.value)
  }
  const handleMerchantInstagramLinkChange = (e) => {
    setCertainState('MerchantInstagramLink', e.target.value)
  }
  const handleMerchantTiktokLinkChange = (e) => {
    setCertainState('MerchantTiktokLink', e.target.value)
  }

  const submitMerchantDetails = () => {
    const merchantId = sessionStorage.uid;

    const modifiedMerchantDetails = {}

    Object.entries(merchantDetails).forEach(key => {
      const newKey = key[0].charAt(8).toLowerCase() + key[0].slice(9)
      modifiedMerchantDetails[`${newKey}`] = key[1]
    });

    modifiedMerchantDetails.pageLink = modifiedMerchantDetails.name

    if(image) {
      console.log(image)
      modifiedMerchantDetails.qrCode = image;
    }

    updateMerchantDetails(modifiedMerchantDetails, merchantId).then(response => {
      if(response) {
        getMerchantDetails(merchantId).then(res => {
          if(res) {
            const {address, qrCode, users, pageViews, reference, email, facebookLink, instagramLink, name, number, pageLink, tagline, tiktokLink} = res.merchantDetails

            setCertainState('MerchantAddress', address);
            setCertainState('MerchantEmail', email);
            setCertainState('MerchantFacebookLink', facebookLink);
            setCertainState('MerchantName', name);
            setCertainState('MerchantNumber', number);
            setCertainState('MerchantPageLink', pageLink)
            setCertainState('MerchantTagline', tagline);
            setCertainState('MerchantTiktokLink', tiktokLink);
            setCertainState('MerchantInstagramLink', instagramLink);
            setCertainState('MerchantReference', reference)
            setCertainState('MerchantPageViews', pageViews)
            setCertainState('MerchantUsers', users)
            setCertainState('MerchantQrCode', qrCode)

            navigate(`/${pageLink}/EditProfile`)
          }
        })
      }
    })
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setImage(file)
    }
  };

  const handleImageClick = () => {
    // Trigger the file input when the label is clicked
    document.getElementById('imageInput').click();
  };

  useEffect(() => {
    if(merchantDetails.merchantQrCode) {
      
      getSingleImageUrl(merchantDetails.merchantQrCode).then((res) => {
        setSelectedImage(res)
      })
      // setSelectedImage(merchantDetails.merchantQrCode)
    }
  }, [merchantDetails])

  return (
    <div className="Edit-profile">
      <Nav setCertainState={setCertainState} merchantDetails={merchantDetails}/>
      <div className='edit-top'>
        <div className="inner-top">
            <h1>Business Details</h1>
            <input type="text" placeholder="Enter your merchant name" value={merchantDetails.merchantName} onChange={handleMerchantNameChange}/>
            <input type="text" placeholder="Enter your comapny's Tagline" value={merchantDetails.merchantTagline} onChange={handleMerchantTaglineChange}/>
            <input type="number" placeholder="Enter your company's contact number" value={merchantDetails.merchantNumber} onChange={handleMerchantNumberChange}/>
            <input type="email" placeholder="Enter your company's email address" value={merchantDetails.merchantEmail} onChange={handleMerchantEmailChange}/>
            <button onClick={submitMerchantDetails} className="saveprofile">Save</button>
            <Link to={'/' + merchantDetails.merchantName}>gO Back</Link>
        </div>

          <div className='inner-bottom'>
            <h1>Socials</h1>
            <input type="text" placeholder="Enter your company's Facebook link" value={merchantDetails.merchantFacebookLink} onChange={handleMerchantFacebookLinkChange}/>
            <input type="text" placeholder="Enter your company's Instagram link" value={merchantDetails.merchantInstagramLink} onChange={handleMerchantInstagramLinkChange}/>
            <input type="text" placeholder="Enter your company's Tiktok link" value={merchantDetails.merchantTiktokLink} onChange={handleMerchantTiktokLinkChange}/>
            <div>
      {/* Label connected to input */}
      <label
        id="imageLabel"
        style={{
          display: 'block',
          width: '200px',
          height: '200px',
          border: '2px dashed #ccc',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          cursor: 'pointer',
          backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
        }}
        onClick={handleImageClick}
      >
        {selectedImage ? null : 'Click to select a picture'}
      </label>

      {/* Input for selecting a picture */}
      <input
        type="file"
        id="imageInput"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
    </div>

          </div>
      </div>


      <div className="edit-bottom">
        <img className="plantOne" src={plant} />
        <img className="plantTwo" src={plant2} />

        {/* <img className="girl" src={ Profilepic} /> */}

      </div>
        
    </div>
  )
}

export default EditProfile
