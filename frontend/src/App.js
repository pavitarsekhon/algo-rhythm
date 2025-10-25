import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8080/api/hello")
        .then((response) => response.text())
        .then((data) => setMessage(data))
        .catch((error) => {
          console.error("Error fetching data:", error);
          setMessage("Failed to load message");
        });
  }, []);

  return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>React + Kotlin + Spring Boot</h1>
        <p>{message}</p>
      </div>
  );
}
export default App;
