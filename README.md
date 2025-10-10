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


## Requirements Provided

**Task 1:**
Write a Node.js program using Puppeteer to scrape odds for a given horse racing event from a bookmaker site. The script should take in the following parameters:
- `eventUrl` (string): The URL of the horse racing event page on the bookmaker site.

The script should use Puppeteer to navigate to the event page, scrape the horse name and odds for the event from the bookmaker site, and return them in a JSON format.

**Task 2:**
Build a RESTful API that exposes an endpoint for scraping odds from a bookmaker site. The API should have the following endpoint:
- `POST /odds`: Scrape odds for a given horse racing event from a bookmaker site.

The request body should contain the following fields:
- `eventUrl` (string): The URL of the sports event page on the bookmaker site.

The API should implement authentication and authorization, so that only authenticated users can access the `/odds` endpoint. You can use an API token or any library of your choice.

**Submission Guidelines:**
- Choose any bookmaker you like. You can get a list of available bookmakers here
- You should submit your code as a Github repository.
- You should use TypeScript
- Include a README file that explains how to run your code and any assumptions you made.
- Your code should be well-organised and easy to understand.
- Your code should be tested and free of bugs.
- Your code should be written in a modular and scalable way.
- Your code should follow best practices for Node.js and React development, including authentication and authorization best practices, and web scraping best practices.