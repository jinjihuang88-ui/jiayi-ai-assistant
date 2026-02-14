const pngToIco = require("png-to-ico").default;
const fs = require("fs");
const path = require("path");

const logoPath = path.join(__dirname, "..", "public", "logo.png");
const outPath = path.join(__dirname, "..", "public", "favicon.ico");

pngToIco(logoPath)
  .then((buf) => {
    fs.writeFileSync(outPath, buf);
    console.log("Generated public/favicon.ico");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
