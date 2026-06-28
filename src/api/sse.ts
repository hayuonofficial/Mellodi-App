import { Response } from "express";

const clients = new Map<string, Response[]>();

/**
 * Add a new SSE client connection for a user
 */
export function addClient(userId: string, res: Response) {
  if (!clients.has(userId)) {
    clients.set(userId, []);
  }
  clients.get(userId)!.push(res);
  console.log(`[SSE] Client connected for user ${userId}. Total clients for user: ${clients.get(userId)!.length}`);
}

/**
 * Remove an SSE client connection
 */
export function removeClient(userId: string, res: Response) {
  const userClients = clients.get(userId);
  if (userClients) {
    const index = userClients.indexOf(res);
    if (index !== -1) {
      userClients.splice(index, 1);
    }
    if (userClients.length === 0) {
      clients.delete(userId);
    }
    console.log(`[SSE] Client disconnected for user ${userId}. Remaining clients: ${userClients.length}`);
  }
}

/**
 * Send an event to all active SSE connections of a specific user
 */
export function sendSSEEvent(userId: string, eventName: string, data: any) {
  const userClients = clients.get(userId);
  if (userClients && userClients.length > 0) {
    console.log(`[SSE] Sending event "${eventName}" to user ${userId} (${userClients.length} connections)`);
    userClients.forEach(res => {
      try {
        res.write(`event: ${eventName}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (err) {
        console.error(`[SSE] Failed to write to client for user ${userId}:`, err);
      }
    });
    return true;
  }
  console.log(`[SSE] User ${userId} is offline. Event "${eventName}" not sent via SSE.`);
  return false;
}
