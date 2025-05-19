import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeSocketServer } from './socket-init';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Start the Socket.IO server separately on port 5000
initializeSocketServer();

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create the HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url!, true);
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Start listening
  server.listen(port, () => {
    console.log(
      `> Next.js server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`
    );
  });
}); 