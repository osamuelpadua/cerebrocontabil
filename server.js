const http = require('http');
const handler = require('serve-handler');

const port = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
  return handler(request, response, { public: '.' });
});

server.listen(port, () => {
  console.log(`Servindo em http://localhost:${port}`);
});
