const selfsigned = require("selfsigned");
const fs = require("fs");

// Attributes
const attrs = [{ name: "commonName", value: "localhost" }];

// Options including your LAN IP as an alt name
const options = {
  days: 365,
  keySize: 2048,
  extensions: [
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" }, // DNS
        { type: 7, ip: "192.168.0.165" }, // IP
      ],
    },
  ],
};

// Generate certificate
const pems = selfsigned.generate(attrs, options);

// Make cert folder if it doesn't exist
if (!fs.existsSync("./cert")) fs.mkdirSync("./cert");

// Save key and cert
fs.writeFileSync("./cert/key.pem", pems.private);
fs.writeFileSync("./cert/cert.pem", pems.cert);

console.log("✅ Self-signed certificate generated in /cert folder!");
