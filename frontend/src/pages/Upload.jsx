import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaFilePdf,
  FaUpload,
} from "react-icons/fa";

function Upload() {

  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [expandedText, setExpandedText] =
    useState("");

  const [mappings, setMappings] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const handleFileChange = (e) => {

    if (e.target.files.length > 0) {

      setSelectedFile(
        e.target.files[0]
      );
    }
  };

  const handleUpload = async () => {

    if (!selectedFile) {

      alert("Please select a PDF file");
      return;
    }

    try {

      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response =
        await fetch(
          "http://127.0.0.1:8000/upload-pdf",
          {
            method: "POST",
            body: formData,
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

      alert("Upload failed");

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
          <FaArrowLeft />
        </button>

        <div>
          MedExpander
        </div>

      </div>

      <div className="center-page">

        <div className="glass-card">

          <div className="upload-icon">
            <FaFilePdf />
          </div>

          <div className="upload-title">
            Upload Clinical PDF
          </div>

          <div className="upload-subtitle">
            Upload discharge summaries,
            prescriptions,
            clinical notes,
            or diagnostic reports.
          </div>

          <div className="file-upload-wrapper">

            <label
              htmlFor="pdfUpload"
              className="custom-file-btn"
            >
              Choose PDF
            </label>

            <input
              id="pdfUpload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              hidden
            />

            <span className="file-name">

              {selectedFile
                ? selectedFile.name
                : "No file selected"}

            </span>

          </div>

          <button
            className="primary-btn"
            onClick={handleUpload}
          >

            <FaUpload />

            {" "}

            {
              loading
                ? "Processing..."
                : "Upload PDF"
            }

          </button>

        </div>

      </div>

      {mappings.length > 0 && (

        <div className="section-box">

          <div className="section-title">
            DETECTED EXPANSION MAPPING
          </div>

          <div className="mapping-container">

            {mappings.map(
              (item, index) => (

                <div
                  className="mapping-card"
                  key={index}
                >

                  {item.abbr}

                  {" → "}

                  {item.meaning}

                </div>

              )
            )}

          </div>

        </div>

      )}

      {expandedText && (

        <div className="section-box">

          <div className="section-title">
            EXPANDED CLINICAL NARRATIVE
          </div>

          <div className="processed-text">
            {expandedText}
          </div>

        </div>

      )}

    </div>
  );
}

export default Upload;