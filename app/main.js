import express from 'express';
import multer from 'multer';


const app = express();
const PORT = process.env.PORT || 3000;
const API_SECRET = process.env.API_SECRET;

// Multer-Konfiguration für Datei-Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Middleware zur Überprüfung des API-Secrets
const checkApiSecret = (req, res, next) => {
  const apiSecret = req.headers['x-api-secret'];
  if (apiSecret !== API_SECRET) {
    return res.status(403).send({ message: 'Zugriff verweigert: Ungültiges API-Secret.' });
  }
  next();
};

// Hilfsfunktion zur Antwortformatierung
const formatResponse = (data, format) => {
  if (format === 'xml') {
    return js2xml(data, { compact: true, spaces: 2 });
  } else if (format === 'json') {
    return JSON.stringify(data, null, 2);
  } else if (format === 'both') {
    const xmlData = js2xml(data, { compact: true, spaces: 2 });
    return { json: data, xml: xmlData };
  }
  return data;
};

// POST-Endpoint zum Hochladen einer Datei mit Secret-Prüfung und Antwortformat
app.post('/api/upload', checkApiSecret, upload.single('file'), async (req, res) => {
  try {
    // Eingehende Datei und gewünschtes Antwortformat überprüfen
    const file = req.file;
    const responseFormat = req.headers['x-response-format'] || req.headers['accept'] || 'json';
    
    // Beispieldaten als Antwortinhalt
    const data = {
      message: 'Datei erfolgreich hochgeladen!',
      file: {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }
    };

    // Antwort basierend auf dem gewünschten Format senden
    if (responseFormat.includes('xml')) {
      res.setHeader('Content-Type', 'application/xml');
      res.send(formatResponse(data, 'xml'));
    } else if (responseFormat.includes('both')) {
      res.setHeader('Content-Type', 'application/json');
      res.send(formatResponse(data, 'both'));
    } else {
      // Standard: JSON
      res.setHeader('Content-Type', 'application/json');
      res.send(formatResponse(data, 'json'));
    }
  } catch (error) {
    console.error('Fehler beim Verarbeiten der Anfrage:', error);
    res.status(500).send({ message: 'Fehler beim Verarbeiten der Anfrage' });
  }
});

// Healthcheck-Endpoint
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
