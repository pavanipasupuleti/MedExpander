import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaKeyboard,
  FaFilePdf,
  FaPen,
  FaMagic,
} from "react-icons/fa";

function Home() {

  const navigate = useNavigate();

  const [inputText, setInputText] = useState("");

  const [expandedText, setExpandedText] =
    useState("");

  const [mappings, setMappings] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const handleExpand = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/expand",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: inputText,
          }),
        }
      );

      const data =
        await response.json();

      console.log(data);

      setExpandedText(
        data.expanded_text || ""
      );

      setMappings(
        data.mappings || []
      );

    } catch (error) {

      console.error(error);

      alert(
        "Backend connection failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="app-container">

      {/* NAVBAR */}

      <div className="navbar">
        MedExpander
      </div>

      {/* MODE CARDS */}

      <div className="mode-container">

        <div
          className="mode-card"
          onClick={() => navigate("/")}
        >
          <div className="mode-icon">
            <FaKeyboard />
          </div>

          <div className="mode-title">
            Paste Text
          </div>
        </div>

        <div
          className="mode-card"
          onClick={() => navigate("/upload")}
        >
          <div className="mode-icon">
            <FaFilePdf />
          </div>

          <div className="mode-title">
            Upload File
          </div>
        </div>

        <div
          className="mode-card"
          onClick={() => navigate("/manual")}
        >
          <div className="mode-icon">
            <FaPen />
          </div>

          <div className="mode-title">
            Manual Input
          </div>
        </div>

      </div>

      {/* TEXT EDITOR */}

      <div className="editor-box">

        <div className="editor-label">
          LIVE EDITOR
        </div>

        <textarea
          className="text-area"
          value={inputText}
          onChange={(e) =>
            setInputText(e.target.value)
          }
        />

        <button
          className="expand-btn"
          onClick={handleExpand}
        >

          <FaMagic />

          {" "}

          {
            loading
              ? "Expanding..."
              : "Expand"
          }

        </button>

        <div style={{ clear: "both" }} />

      </div>

      {/* MAPPINGS */}

      {
        mappings.length > 0 && (

          <div className="section-box">

            <div className="section-title">
              DETECTED EXPANSION MAPPING
            </div>

            <div className="mapping-container">

              {
                mappings.map(
                  (item, index) => (

                    <div
                      className="mapping-card"
                      key={index}
                    >
                      <strong>
                        {item.abbr}
                      </strong>

                      {" → "}

                      {item.meaning}
                    </div>
                  )
                )
              }

            </div>

          </div>
        )
      }

      {/* EXPANDED TEXT */}

      {
        expandedText && (

          <div className="section-box">

            <div className="section-title">
              EXPANDED CLINICAL NARRATIVE
            </div>

            <div className="processed-text">
              {expandedText}
            </div>

          </div>
        )
      }

    </div>
  );
}

export default Home;