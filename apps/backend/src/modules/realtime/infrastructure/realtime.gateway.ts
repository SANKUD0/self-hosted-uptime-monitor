import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeEventMap, RealtimeEventName } from '../domain/realtime-events';

/**
 * This class represents a WebSocket gateway for real-time communication.
 * It handles client connections, disconnections, and broadcasting of events.
 * The gateway is configured to allow CORS from 'http://localhost:3000' and 'http://localhost:3003' and uses the '/realtime' namespace.
 */
//TODO: Make compatible with docker and load balancing
@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'http://localhost:3003'], credentials: true },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  /**
   * Called after the WebSocket gateway has been initialized.
   * Logs a message indicating that the gateway is ready to accept connections.
   */
  afterInit(): void {
    this.logger.log('WebSocket gateway initialisé sur /realtime');
  }

  /**
   * Called when a client connects to the WebSocket gateway.
   * Logs the client's socket ID.
   * @param client - The connected client socket.
   */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  /**
   * Called when a client disconnects from the WebSocket gateway.
   * Logs the client's socket ID.
   * @param client - The disconnected client socket.
   */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  /**
   * Broadcasts a real-time event to all connected clients.
   * @param event - The name of the event to broadcast.
   * @param payload - The payload associated with the event.
   */
  broadcast<E extends RealtimeEventName>(
    event: E,
    payload: RealtimeEventMap[E],
  ): void {
    this.server.emit(event, payload);
  }
}