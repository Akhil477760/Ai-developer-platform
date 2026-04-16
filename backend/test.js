const fetch = require("node-fetch");

async function testAPI() {
  const res = await fetch("http://localhost:5000/analyze-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: "var x = 10; if(x == 10){ console.log(x); }"
    }),
  });

  const data = await res.json();
  console.log(data);
}

testAPI();