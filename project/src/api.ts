import express, { Request, Response } from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

const EXTERNAL_API_URL = 'https://rest-test-eight.vercel.app/api/test';

interface FileStructure {
  [key: string]: any;
}

const transformData = (data: string[]): FileStructure => {
  const result: FileStructure = {};
  
  data.forEach(url => {
    const urlParts = url.split('/');
    const ip = urlParts[2].split(':')[0];
    const pathParts = urlParts.slice(3);
    
    if (!result[ip]) result[ip] = [];
    let currentLevel = result[ip];
    
    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        // It's a file
        if (Array.isArray(currentLevel)) {
          currentLevel.push(part);
        } else {
          currentLevel.push(part);
        }
      } else {
        // It's a directory
        let dirObj = currentLevel.find((item: any) => typeof item === 'object' && item[part]);
        if (!dirObj) {
          dirObj = { [part]: [] };
          currentLevel.push(dirObj);
        }
        currentLevel = dirObj[part];
      }
    });
  });
  
  return result;
};

router.get('/files', async (req: Request, res: Response) => {
  try {
    console.log('Received request for /files');
    
    const cachedData = cache.get('files');
    if (cachedData) {
      console.log('Serving from cache');
      return res.json(cachedData);
    }

    console.log('Fetching data from external API:', EXTERNAL_API_URL);
    const response = await axios.get(EXTERNAL_API_URL);
    const urls = response.data.items.map((item: any) => item.fileUrl);
    console.log('Data fetched from external API:', urls);

    const transformedData = transformData(urls);
    cache.set('files', transformedData);
    
    res.json(transformedData);
  } catch (error) {
    const err = error as any; // Explicitly cast the error to any type
    console.error('Error fetching data:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Response status:', err.response.status);
      console.error('Response headers:', err.response.headers);
    } else if (err.request) {
      console.error('Request data:', err.request);
    }
    res.status(500).send('Error fetching data');
  }
});

export default router;
