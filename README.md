# Horse Racing Odds Scraper API

A Node.js/TypeScript application that scrapes horse racing odds from bookmaker websites using Puppeteer and exposes them via a RESTful API. 

The webscraper can be used independently of the API via the CLI as explained in the usage guide.

## Features

-  Scrape horse racing odds from bookmaker websites in real-time
-  JWT-based authentication
-  Synchronous response (no queuing needed)
-  RESTful API with proper error handling
-  CLI interface for standalone scraping on a local machine

## Assumptions Made and Design Choices

### No Redis Caching/Database Storage
Horse racing odds change every few seconds during live events. Caching would provide stale data that could be misleading or financially dangerous for users making betting decisions. Real-time accuracy is more valuable than performance optimization.

However, if we wanted to provide analytical insights, we could store the results in a time series database (either in a pure timeseries DB like Cassandra or InfluxDB, or a standard relational DB like PostgreSQL). This would enable analysis of how odds change over time, identify patterns, and provide historical data for analysis.

### No Async Job Processing
Scraping data from a single page with Puppeteer typically completes within 2-5 seconds if we don't need to do extensive navigation or complex operations, which is acceptable for synchronous HTTP responses. The added complexity of job queues, polling endpoints, and state management isn't justified for this response time. 

For more complex scraping jobs that require longer processing times (multiple pages, complex interactions, or bulk operations), we could implement an async architecture.

## Deployment Architecture Considerations
This application is designed assuming deployment on AWS EC2 instances (or simmilar server). However, depending on requirements, a serverless architecture might be more appropriate:

### EC2 (or simmilar server) Deployment (Current Design)
- **Pros**: Persistent browser instances, predictable performance, easier debugging, completely provider agnostic
- **Cons**: Fixed capacity, manual scaling, server management overhead
- **Best for**: Consistent traffic patterns, need for persistent connections

### Lambda + API Gateway Alternative
- **Pros**: Auto-scaling, pay-per-request, no server management, built-in rate limiting
- **Cons**: Cold starts, 15-minute timeout limit, limited memory/CPU options
- **Best for**: Sporadic traffic, cost optimization, event-driven workloads
