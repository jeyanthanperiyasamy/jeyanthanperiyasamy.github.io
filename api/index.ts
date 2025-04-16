process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;
app.use(express.json());

// In-memory context status store
const contextStore: Record<string, { userId: string; approved: boolean }> = {};

// Endpoint to send push notification and return a contextId
app.post('/send-notification', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const contextId = uuidv4();
  contextStore[contextId] = { userId, approved: false };

  console.log(`Sending mock push to user: ${userId}, contextId: ${contextId}`);
  res.json({ contextId });

  // Simulate approval after 60 seconds
  setTimeout(() => {
    console.log('------> approved later')
    contextStore[contextId].approved = true;
    console.log(`User ${userId} approved context ${contextId}`);
  }, 100000);
});

// Poll endpoint to check if push was approved
app.get('/check-status/:contextId', (req: Request, res: Response) => {
  const { contextId } = req.params;

  const context = contextStore[contextId];
  if (!context) {
    return res.status(404).json({ error: 'Invalid contextId' });
  }

  res.json({ approved: context.approved });
});

app.listen(port, () => {
  console.log(`Mock Push Notification server running at http://localhost:${port}`);
});