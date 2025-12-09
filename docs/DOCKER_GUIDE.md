# Docker Setup Guide

## Quick Start

### Start all services (MongoDB + Redis + Admin UIs)
```bash
docker-compose up -d
```

### Start only MongoDB and Redis (without admin interfaces)
```bash
docker-compose up -d mongodb redis
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove all data
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f
```

## Services

### MongoDB
- **Port:** 27017
- **Database:** ggomruk
- **Connection String:** `mongodb://localhost:27017/ggomruk`

### Redis
- **Port:** 6379
- **Connection String:** `localhost:6379`

### Mongo Express (Optional Admin UI)
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** admin123
- A web-based MongoDB admin interface to view and manage your database

### Redis Commander (Optional Admin UI)
- **URL:** http://localhost:8082
- A web-based Redis admin interface to view and manage cached data

## Useful Commands

### Check running containers
```bash
docker-compose ps
```

### Restart a specific service
```bash
docker-compose restart mongodb
docker-compose restart redis
```

### Access MongoDB shell
```bash
docker exec -it ggomruk_mongodb mongosh
```

### Access Redis CLI
```bash
docker exec -it ggomruk_redis redis-cli
```

### View specific service logs
```bash
docker-compose logs -f mongodb
docker-compose logs -f redis
```

## Data Persistence

All data is persisted in Docker volumes:
- `mongodb_data` - MongoDB database files
- `mongodb_config` - MongoDB configuration
- `redis_data` - Redis data with AOF persistence enabled

Even if you stop containers, your data will remain unless you use `docker-compose down -v`.
