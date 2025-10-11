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
### Using Puppeteer
As the requirements of the test say to use puppeteer I will implment in that way but looking at the betting websites it may be better to use pure HTTP requests and HTML parser like cheerio. This would be cheaper and quicker to run that puppeteer although Puppeteer provides flexibility if some of the websites turn out not to be easily scrapable by HTTP requests alone. Cost is not really a problem to use puppeteer rather than fetch or axios as the largest cost on scraping is usually proxies however speed may be for this use case so it would be something to consider.

### Running on a Server
In practice for these requirements unless clarified would suggest that a serverless implementation would be best for speed of development, maintanence and cost 

### No Redis Caching/Database Storage
Horse racing odds change every few seconds during live events. Caching would provide stale data that could be misleading or financially dangerous for users making betting decisions. Real-time accuracy is more valuable than performance optimization.

However, if we wanted to provide analytical insights, we could store the results in a time series database (either in a pure timeseries DB like Cassandra or InfluxDB, or a standard relational DB like PostgreSQL). This would enable analysis of how odds change over time, identify patterns, and provide historical data for analysis.

### No Async Job Processing
Scraping data from a single page with Puppeteer typically completes within 2-5 seconds if we don't need to do extensive navigation or complex operations, which is acceptable for synchronous HTTP responses. The added complexity of job queues, polling endpoints, and state management isn't justified for this response time. 

For more complex scraping jobs that require longer processing times (multiple pages, complex interactions, or bulk operations), we could implement an async architecture.

## Implementation Strategy and Potential Future AWS Architecture

### Current Implementation: Express.js Server
This project is implemented as an Express.js server to demonstrate the API functionality and allow for easy local development and testing. The core scraping logic and API design patterns are production-ready and can be easily adapted for serverless deployment.

### Recommended Production Architecture: AWS API Gateway + Lambda
For production deployment, this application would be better suited for a serverless architecture using AWS API Gateway and Lambda functions:

**Benefits of Serverless Approach:**
- **Auto-scaling**: Automatically handles traffic spikes without manual intervention
- **Cost Efficiency**: Pay-per-request model, no idle server costs
- **Simplified Infrastructure**: No server management, patching, or capacity planning
- **Built-in Monitoring**: CloudWatch integration for logs, metrics, and alerts out-of-the-box
- **Built-in Security**: API Gateway provides built-in rate limiting and API key management
- **Easy CI/CD**: Serverless deployment integrates well with IaC and CICD tooling

**Architecture Components:**
- **API Gateway**: Handle HTTP requests, authentication, rate limiting, and request/response transformation
- **Lambda Functions**: Execute scraping logic with automatic scaling
- **CloudWatch**: Centralized logging and monitoring without additional setup
- **AWS Secrets Manager**: Secure storage for API tokens and sensitive configuration

**Comparison with Traditional Server Deployment:**
- **Express on EC2**: Requires manual scaling, server management, separate logging/monitoring setup
- **Serverless**: Cloud-native observability, automatic scaling, reduced operational overhead


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