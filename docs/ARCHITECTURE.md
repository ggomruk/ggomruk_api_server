# System Architecture Implementation Plan

## Overview
Event-Driven Microservices Architecture using Redis Pub/Sub for communication between API Server (NestJS) and Analytics Server (Python), with WebSocket for real-time client updates.

## Architecture Components

### 1. Client (Web Browser)
- Sends HTTP requests to create/configure trading strategies
- Maintains WebSocket connection for real-time updates
- Receives progress notifications and completion events

### 2. API Server (NestJS - Port 4000)
- **REST API**: Handles client requests, saves to MongoDB
- **WebSocket Gateway**: Manages client connections, broadcasts updates
- **Redis Publisher**: Publishes backtest tasks to analytics server
- **Redis Subscriber**: Listens for progress/completion events from analytics

### 3. Analytics Server (Python)
- **Redis Subscriber**: Listens for backtest task requests
- **Backtest Engine**: Executes trading strategies, calculates performance
- **Redis Publisher**: Sends progress updates and results
- **MongoDB Client**: Saves final results to database

### 4. Redis
- **Pub/Sub Channels**:
  - `backtest:task` - Tasks from API to Analytics
  - `backtest:progress` - Progress updates from Analytics
  - `backtest:complete` - Completion notifications
  - `backtest:error` - Error notifications

### 5. MongoDB
- Stores users, backtests, results, market data
- Shared between API and Analytics servers

## Message Flow

```
1. Client → API Server (HTTP POST)
   POST /api/algo/backtest
   { userId, symbol, strategies, params }

2. API Server → MongoDB
   Save backtest record with status: "pending"

3. API Server → Redis Pub/Sub
   PUBLISH backtest:task
   { backtestId, userId, params }

4. Python Analytics (Subscriber)
   Receives task, starts processing

5. Python → Redis Pub/Sub (Progress)
   PUBLISH backtest:progress
   { backtestId, progress: 25%, message }

6. API Server (Subscriber) → WebSocket
   Broadcasts to client via WebSocket

7. Python → MongoDB
   Save results when complete

8. Python → Redis Pub/Sub (Complete)
   PUBLISH backtest:complete
   { backtestId, status, resultId }

9. API Server → Client (WebSocket)
   Final notification with results
```

## Implementation Checklist

### Phase 1: Redis Pub/Sub Service (API Server)
- [x] Redis module already exists
- [ ] Create Redis Pub/Sub service for message queue
- [ ] Add methods to publish backtest tasks
- [ ] Add methods to subscribe to progress/complete channels
- [ ] Handle message parsing and validation

### Phase 2: WebSocket Gateway (API Server)
- [x] WebSocket module already exists
- [ ] Create backtest-specific WebSocket events
- [ ] Implement room-based connections (per user)
- [ ] Subscribe to Redis channels and broadcast to clients
- [ ] Handle client connection/disconnection

### Phase 3: Algo Controller & Service (API Server)
- [ ] Update `algo.controller.ts` to accept backtest requests
- [ ] Modify `algo.service.ts` to save to MongoDB and publish to Redis
- [ ] Add endpoints for retrieving backtest status/results
- [ ] Implement error handling and validation

### Phase 4: Python Analytics Server
- [ ] Create Redis subscriber script
- [ ] Implement backtest task processor
- [ ] Add progress reporting (publish to Redis)
- [ ] Implement result saving to MongoDB
- [ ] Add error handling and logging

### Phase 5: Testing & Integration
- [ ] Test end-to-end flow
- [ ] Test error scenarios
- [ ] Test concurrent backtests
- [ ] Performance testing
- [ ] Add monitoring/logging

## Redis Channel Schema

### backtest:task
```json
{
  "backtestId": "bt_abc123",
  "userId": "user123",
  "params": {
    "symbol": "BTCUSDT",
    "interval": "1h",
    "startDate": "2024-01-01",
    "endDate": "2024-12-01",
    "strategies": ["sma", "rsi"],
    "strategyParams": {...}
  }
}
```

### backtest:progress
```json
{
  "backtestId": "bt_abc123",
  "userId": "user123",
  "progress": 50,
  "message": "Processing 2024-06-01",
  "currentDate": "2024-06-01"
}
```

### backtest:complete
```json
{
  "backtestId": "bt_abc123",
  "userId": "user123",
  "status": "success",
  "resultId": "res_xyz789",
  "summary": {
    "totalReturn": 25.5,
    "sharpeRatio": 1.8,
    "maxDrawdown": -15.2
  }
}
```

### backtest:error
```json
{
  "backtestId": "bt_abc123",
  "userId": "user123",
  "status": "error",
  "error": "Insufficient market data",
  "timestamp": "2024-12-09T15:30:00Z"
}
```

## WebSocket Events (Client ↔ API Server)

### Client → Server
- `backtest:subscribe` - Subscribe to backtest updates
- `backtest:unsubscribe` - Unsubscribe from updates

### Server → Client
- `backtest:started` - Backtest has started
- `backtest:progress` - Progress update
- `backtest:complete` - Backtest completed successfully
- `backtest:error` - Backtest failed

## Database Schema Updates

### Backtest Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  status: String, // 'pending', 'running', 'completed', 'failed'
  params: Object,
  resultId: ObjectId, // Reference to Result
  progress: Number, // 0-100
  createdAt: Date,
  updatedAt: Date,
  startedAt: Date,
  completedAt: Date
}
```

## Benefits of This Architecture

1. **Decoupling**: API and Analytics servers are independent
2. **Real-time Updates**: WebSocket provides instant feedback
3. **Scalability**: Can add multiple Python workers
4. **Reliability**: Redis Pub/Sub is battle-tested
5. **Flexibility**: Easy to add new features/workers
6. **Performance**: Asynchronous processing doesn't block API

## Next Steps

Starting implementation in order:
1. Redis Pub/Sub Service (messageQueue module)
2. WebSocket Gateway updates
3. Algo Controller/Service updates
4. Python Analytics Redis integration
