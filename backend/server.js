require("dotenv").config({ path : __dirname + "/.env" });
const OpenAI = require("openai");
const express = require('express');
const cors = require('cors');
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "mysecretkey";


console.log("API Key loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/test", (req, res) => {
    res.send("Test endpoint is working");
}
);

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

        db.query(sql, [name, email, hashedPassword], (err, result) => {
            if (err) {
                console.log("DB Error:", err);
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: "User registered securely ✅" });
        });

    } catch (error) {
        console.log("Hash Error:", error);
        res.status(500).json({ error: "Hashing error" });
    }
});

app.post("/login", async (req, res) => {
    console.log("Login request:", req.body);

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.log("DB Error:", err);
            return res.status(500).json({ error: "DB error" });
        }

        if (result.length === 0) {
            console.log("User not found");
            return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                console.log("Invalid password");
                return res.status(400).json({ error: "Invalid password" });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                SECRET_KEY,
                { expiresIn: "1h" }
            );

            console.log("Login successful");

            res.json({
                message: "Login successful ",
                token: token
            });

        } catch (error) {
            console.log("Error in bcrypt/jwt:", error);
            res.status(500).json({ error: "Server error" });
        }
    });
});

app.get("/profile", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ user: decoded });
    } catch (error) {
        console.log("JWT Error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});

app.post("/analyze-code", (req, res) => {
    const { code } = req.body;

    if (!code || code.trim() === "") {
        return res.status(400).json({ error: "Code is required" });
    }

    let suggestions = [];

    if (code.includes("var ")) {
        suggestions.push("Avoid using 'var'. Use 'let' or 'const' instead.");
    }

    if (code.includes("==")) {
        suggestions.push("Use strict equality '===' instead of '=='.");
    }

    if (code.length < 20) {
        suggestions.push("Code is too short. Add more meaningful logic.");
    }

    if (!code.includes("function") && !code.includes("=>")) {
        suggestions.push("Consider organizing logic using functions.");
    }

    if (suggestions.length === 0) {
        suggestions.push("Code looks clean. No major issues found.");
    }

    res.json({
        message: "Code analysis complete ✅",
        suggestions
    });
});

// app.post("/analyze-code", async (req, res) => {
//   const { code } = req.body;

//   if (!openai) {
//     return res.status(500).json({ error: "OpenAI API key not loaded" });
//   }

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [
//         {
//           role: "system",
//           content: "You are a code reviewer. Give short suggestions.",
//         },
//         {
//           role: "user",
//           content: code,
//         },
//       ],
//     });

//     res.json({
//       suggestions: [response.choices[0].message.content],
//     });
//   } catch (error) {
//     console.log("OpenAI Error:", error);
//     res.status(500).json({ error: "AI error" });
//   }
// });




app.listen(5000, () => {
    console.log("Server is running on port 5000");
});


