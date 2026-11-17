require('dotenv').config({ path: __dirname + '/../.env' });
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` API SETAR Yacuiba corriendo en http://localhost:${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
});