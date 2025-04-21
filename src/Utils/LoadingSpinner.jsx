import React from "react";
import { useLoading } from "../Context/LoadingContext";
import ClipLoader from "react-spinners/RingLoader";
import "../App.css";

export default function LoadingSpinner() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="spinner-overlay">
      <ClipLoader color="#FFFFFF" size={150} />
    </div>
  );
}
