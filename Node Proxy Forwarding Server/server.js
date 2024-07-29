// Purpose: A Node.js server that acts as a proxy to authenticate and fetch users from the OLAT REST API.

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";
import xml2js from "xml2js";

const app = express();
const port = 3000;

app.use(cors());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    return res.status(200).json({});
  }
  next();
});

// Parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Authentication forwarding endpoint
app.get("/auth/:username", async (req, res) => {
  const { username } = req.params;
  const { password } = req.query;

  // Make a GET request to authenticate and get the bearer token
  try {
    const tokenResponse = await fetch(
      `http://localhost:8088/restapi/auth/${username}?password=${password}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (tokenResponse.ok) {
      // Get the value of X-OLAT-TOKEN header from the response
      const xOlatToken = tokenResponse.headers.get("X-OLAT-TOKEN");

      console.log("Authenticated successfully:", xOlatToken);

      // Set the X-OLAT-TOKEN header in the response
      res.header("X-OLAT-TOKEN", xOlatToken);

      // Send back only the X-OLAT-TOKEN value
      res.status(200).send(xOlatToken);
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Users
app.get("/users", async (req, res) => {
  try {
    const usersResponse = await getResponse(req, res, "/users");

    if (usersResponse.ok) {
      // Get the XML response as text
      const xmlResponseText = await usersResponse.text();

      // Parse the XML response into a JavaScript object
      xml2js.parseString(xmlResponseText, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        // Convert the JavaScript object into a JSON string
        const jsonResult = JSON.stringify(result);

        console.log("Users fetched successfully:", jsonResult);
        // Send the JSON response
        res.status(200).send(jsonResult);
      });
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error("Error during fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/courses", async (req, res) => {
  try {
    const coursesResponse = await getResponse(req, res, "/repo/courses");

    if (coursesResponse.ok) {
      // Get the XML response as text
      const xmlResponseText = await coursesResponse.text();

      // Parse the XML response into a JavaScript object
      xml2js.parseString(xmlResponseText, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          res.status(500).send("Internal Server Error");
          return;
        }

        // Convert the JavaScript object into a JSON string
        const jsonResult = JSON.stringify(result);

        console.log("Courses fetched successfully:", jsonResult);
        // Send the JSON response
        res.status(200).send(jsonResult);
      });
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error("Error during fetching courses:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function getResponse(req, res, apiEndpoint) {
  console.log(req.headers);
  const token = req.headers["x-olat-token"];
  console.log("X-OLAT-TOKEN:", token);
  try {
    // Make a GET request to fetch users
    const response = await fetch(
      `http://localhost:8088/restapi${apiEndpoint}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-OLAT-TOKEN": token,
        },
      }
    );
    return response;
  } catch (error) {
    console.error(`Error during fetching ${apiEndpoint}`, error);
    res.status(500).send("Internal Server Error");
    return;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}/`);
});
