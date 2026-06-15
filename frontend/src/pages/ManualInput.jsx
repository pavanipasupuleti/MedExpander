import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaMagic,
} from "react-icons/fa";

function Manual() {

  const navigate = useNavigate();

  const [abbr, setAbbr] =
    useState("");

 

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  
  const handleSearch = async () => {

    if (!abbr.trim()) {

      alert(
        "Please enter an abbreviation"
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await fetch(
          "http://127.0.0.1:8000/lookup-abbreviation",
          {
            method: "POST",

            headers: {
              "Content-Type":
              "application/json",
            },

            body: JSON.stringify({
              abbreviation: abbr,
              
            }),
          }
        );

      const data =
        await response.json();

      console.log(data);

      setResult(data);

    } catch (error) {

      console.error(error);

      alert(
        "Lookup failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="app-container">

      <div className="navbar">

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft size={28} />
        </button>

        <div>
          MedExpander
        </div>

      </div>

      <div className="center-page">

        <div className="glass-card">

          <div className="upload-title">
           Manual Input 
          </div>

          <div className="upload-subtitle">

          Search medical abbreviations

          </div>

          <input
            type="text"
            placeholder="Enter abbreviation..."
            value={abbr}
            onChange={(e) =>
              setAbbr(e.target.value)
            }
          />

          <button
            className="primary-btn"
            onClick={handleSearch}
            style={{
              marginTop: "28px",
            }}
          >

            <FaMagic />

            {" "}

            {
              loading
                ? "Searching..."
                : "Search"
            }

          </button>

          <div
            style={{
              marginTop: "50px",
              textAlign: "left",
            }}
          >

            <div className="section-title">
              Result
            </div>

            <div className="processed-text">

              {!result && (

                <div>
                  Waiting for input...
                </div>

              )}

              {result &&
                result.found === false && (

                <div>
                  ❌ {result.message}
                </div>

              )}

              {result &&
                result.found === true && (

                  <div>

                  <p>
                    <strong>Abbreviation:</strong>{" "}
                    {result.abbreviation}
                  </p>
                
                  <p>
                    <strong>Expansion:</strong>{" "}
                    {result.expansion}
                  </p>
                
                  <p>
                    <strong>Type:</strong>{" "}
                    {result.semantic_type}
                  </p>
                
                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Manual;