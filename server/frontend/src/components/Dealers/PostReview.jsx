import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';


const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState();
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0,curr_url.indexOf("postreview"));
  let params = useParams();
  let id =params.id;
  let dealer_url = root_url+`djangoapp/dealer/${id}`;
  let review_url = root_url+`djangoapp/add_review`;
  let carmodels_url = root_url+`djangoapp/get_cars`;

  const postreview = async ()=>{
    let name = sessionStorage.getItem("firstname")+" "+sessionStorage.getItem("lastname");
    //If the first and second name are stores as null, use the username
    if(name.includes("null")) {
      name = sessionStorage.getItem("username");
    }
    if(!model || review === "" || date === "" || year === "" || model === "") {
      alert("All details are mandatory")
      return;
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split[1];

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true,
      "purchase_date": date,
      "car_make": make_chosen,
      "car_model": model_chosen,
      "car_year": year,
    });

    console.log(jsoninput);
    const res = await fetch(review_url, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: jsoninput,
  });

  const json = await res.json();
  console.log("Response:", json);
  if (json.status === 200) {
      alert("Review posted successfully!");
      window.location.href = window.location.origin+"/dealer/"+id;
  } else {
      alert("Error posting review: " + (json.message || "Unknown error"));
  }

  }
  const get_dealer = async ()=>{
    const res = await fetch(dealer_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    if(retobj.status === 200) {
      let dealerobjs = Array.from(retobj.dealer)
      if(dealerobjs.length > 0)
        setDealer(dealerobjs[0])
    }
  }

  const get_cars = async ()=>{
    const res = await fetch(carmodels_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    let carmodelsarr = Array.from(retobj.CarModels)
    setCarmodels(carmodelsarr)
  }
  useEffect(() => {
    get_dealer();
    get_cars();
  },[]);


  return (
    <div>
      <Header/>
      <div style={{margin:"5%", maxWidth:"800px", marginLeft:"auto", marginRight:"auto"}}>
        <div style={{backgroundColor:"#f8f9fa", padding:"30px", borderRadius:"10px", boxShadow:"0 4px 6px rgba(0,0,0,0.1)"}}>
          <h1 style={{color:"#2c3e50", textAlign:"center", marginBottom:"30px", fontSize:"28px"}}>
            Write a Review for {dealer.full_name}
          </h1>
          
          <div style={{backgroundColor:"white", padding:"20px", borderRadius:"8px", marginBottom:"20px"}}>
            <label style={{display:"block", marginBottom:"10px", fontWeight:"bold", color:"#34495e"}}>
              Your Review *
            </label>
            <textarea 
              id='review' 
              cols='50' 
              rows='5' 
              placeholder="Share your experience with this dealership..."
              onChange={(e) => setReview(e.target.value)}
              style={{
                width:"100%", 
                padding:"12px", 
                border:"2px solid #e0e0e0", 
                borderRadius:"6px",
                fontSize:"14px",
                fontFamily:"Arial, sans-serif",
                resize:"vertical",
                minHeight:"100px",
                boxSizing:"border-box"
              }}
            />
          </div>

          <div style={{backgroundColor:"white", padding:"20px", borderRadius:"8px", marginBottom:"20px"}}>
            <label style={{display:"block", marginBottom:"10px", fontWeight:"bold", color:"#34495e"}}>
              Purchase Date *
            </label>
            <input 
              type="date" 
              onChange={(e) => setDate(e.target.value)}
              style={{
                width:"100%", 
                padding:"12px", 
                border:"2px solid #e0e0e0", 
                borderRadius:"6px",
                fontSize:"14px",
                boxSizing:"border-box"
              }}
            />
          </div>

          <div style={{backgroundColor:"white", padding:"20px", borderRadius:"8px", marginBottom:"20px"}}>
            <label style={{display:"block", marginBottom:"10px", fontWeight:"bold", color:"#34495e"}}>
              Car Make & Model *
            </label>
            <select 
              name="cars" 
              id="cars" 
              onChange={(e) => setModel(e.target.value)}
              style={{
                width:"100%", 
                padding:"12px", 
                border:"2px solid #e0e0e0", 
                borderRadius:"6px",
                fontSize:"14px",
                backgroundColor:"white",
                boxSizing:"border-box"
              }}
            >
              <option value="" selected disabled hidden>Choose Car Make and Model</option>
              {carmodels.map(carmodel => (
                  <option key={carmodel.id} value={carmodel.CarMake+" "+carmodel.CarModel}>
                    {carmodel.CarMake} {carmodel.CarModel}
                  </option>
              ))}
            </select>        
          </div >

          <div style={{backgroundColor:"white", padding:"20px", borderRadius:"8px", marginBottom:"30px"}}>
            <label style={{display:"block", marginBottom:"10px", fontWeight:"bold", color:"#34495e"}}>
              Car Year *
            </label>
            <input 
              type="number" 
              onChange={(e) => setYear(e.target.value)} 
              max={2024} 
              min={2000}
              placeholder="e.g. 2022"
              style={{
                width:"100%", 
                padding:"12px", 
                border:"2px solid #e0e0e0", 
                borderRadius:"6px",
                fontSize:"14px",
                boxSizing:"border-box"
              }}
            />
          </div>

          <div style={{textAlign:"center"}}>
            <button 
              className='postreview' 
              onClick={postreview}
              style={{
                backgroundColor:"#3498db",
                color:"white",
                padding:"15px 40px",
                border:"none",
                borderRadius:"8px",
                fontSize:"16px",
                fontWeight:"bold",
                cursor:"pointer",
                boxShadow:"0 2px 4px rgba(0,0,0,0.2)",
                transition:"all 0.3s ease"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#2980b9"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#3498db"}
            >
              📝 Post Review
            </button>
          </div>
          
          <div style={{marginTop:"20px", textAlign:"center", color:"#7f8c8d", fontSize:"12px"}}>
            * All fields are required
          </div>
        </div>
      </div>
    </div>
  )
}
export default PostReview
