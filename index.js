const server = require("./app");
const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Express just departed from port ${port}!`);
});
