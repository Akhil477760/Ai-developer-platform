import { useState } from "react";

function CodeReview() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState([]);

  const handleAnalyze = async () => {
    const res = await fetch("http://localhost:5000/analyze-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (data.suggestions) {
      setResult(data.suggestions);
    } else {
      setResult([data.error]);
    }
  };

 return (
  <div style={{ marginTop: "20px" }}>
    <h3>AI Code Review</h3>

    <textarea
      rows="8"
      placeholder="Paste your code here..."
      value={code}
      onChange={(e) => setCode(e.target.value)}
    />

    <button onClick={handleAnalyze}>Analyze Code</button>

    <div style={{ marginTop: "15px" }}>
      {result.map((item, index) => (
        <p key={index}>• {item}</p>
      ))}
    </div>
  </div>
);
}

export default CodeReview;