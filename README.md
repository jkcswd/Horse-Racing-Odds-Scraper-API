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
### Validation
The validation on input needed is very minimal in this use case so I did not use any libraries but in a production environment with more complex input into or out of the API I would use the Zod validation library.

### Auth
We only need a key to verify the ability to access. We don't need granular permissions on the JWT. We could expand later with granular permissions if the requirements change.

## Anti Detection Settings 
I have not applied any anti bot detection configurations (apart from sensible viewport and user agent) as running locally we are not likely to run in to these issues. I have built the code so that it can be extended with proxies or even a hosted browser configured to avoid bot detection. There are further tools we can implement like making the headless browsers behavior more human through natural mouse movements, visiting other pages on the website and interacting with them. However even in production we should not spend time implementing solutions that are not yet needed or likely to be needed to keep in line with principles of YAGNI and KISS.

### Browser Pooling
I have not implemented proper browser pooling this for this use case but in production we could pool and manage browsers using p-queue or similar if on an EC2. If on AWS lambdas we could share and manage browsers for efficiency although it is also not awful to just spin up a new browser in each lambda instance as the compute costs are not usually the bottleneck for cost (that is proxies) and the websites themselves are usually the bottleneck for performance. However, if given the time and resources pooling the browsers would be optimal.

### Using Puppeteer 
As the requirements specify using Puppeteer, I will implement the solution accordingly. However, sometimes it is very easy to implement a curl + HTML parser solution. I have only investigated ladbrookes and that website in particular seems to be easier to scrape using puppeteer although other websites may have more easily accessible APIs which would lend themselves to using fetch in the code.

### Deployment Architecture Implementation Approach
For these requirements, unless otherwise specified, a serverless implementation would be optimal for development speed, maintenance, and cost efficiency. However, I have chosen to deploy this on an express server for ease of local development and displaying my understanding of creating an API which can be easily run and tested by anyone.

### No Redis Caching/Database Storage
Horse racing odds change every few seconds during live events. Caching would provide stale data that could be misleading or financially dangerous for users making betting decisions. Real-time accuracy is more valuable than performance optimization.

However, if we wanted to provide analytical insights, we could store the results in a time series database (either in a pure timeseries DB like Cassandra or InfluxDB, or a standard relational DB like PostgreSQL). This would enable analysis of how odds change over time, identify patterns, and provide historical data for analysis.

### Using Symmetric vs Asymmetric JWT Signing

**Current Implementation: Symmetric (HMAC-SHA256)**
In the current Express.js implementation, I use symmetric JWT signing with a shared secret because:

- **Single Service Architecture**: The same Express server handles both JWT creation (for test tokens) and verification (for API requests)
- **Simplified Key Management**: Only one secret key needs to be managed and deployed
- **Development Simplicity**: Easier to set up and test locally without managing key pairs (under time constraints for completing the project)

**Production AWS Architecture: Asymmetric (RS256/ES256)**  
For the AWS serverless deployment I recommend later, asymmetric signing would be preferred because:

- **Service Separation**: Different services handle signing vs verification
  - **Auth Service**: Signs JWTs with private key (user login, token refresh)
  - **API Gateway + Lambda Authorizer**: Verifies JWTs with public key only
  - **Business Logic Lambdas**: Never need access to any signing keys

- **Enhanced Security**: 
  - Business logic Lambdas cannot create tokens, only the auth service can
  - Compromising a scraping Lambda doesn't expose token creation capability
  - Public keys can be safely distributed across multiple services

- **Operational Benefits**:
  - **Key Rotation**: Update private key without redeploying all services
  - **Audit Trail**: Clear separation of who can create vs verify tokens  
  - **Microservices Ready**: Multiple independent services can verify tokens

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
- **Lambda Authorizer**: JWT verification using asymmetric keys (RS256) for enhanced security
- **Lambda Functions**: Execute scraping logic with automatic scaling
- **AWS Secrets Manager**: Secure storage for JWT private keys and sensitive configuration
- **AWS Systems Manager Parameter Store**: Public key distribution for JWT verification
- **CloudWatch**: Centralized logging and monitoring without additional setup

**Security Architecture:**
- **Asymmetric JWT**: Private key for signing (auth service), public key for verification (API Gateway)
- **Service Isolation**: Business logic Lambdas never access signing keys
- **Key Rotation**: Easy public key distribution without service downtime

**Comparison with Traditional Server Deployment:**
- **Express on EC2**: Requires manual scaling, server management, separate logging/monitoring setup
- **Serverless**: Cloud-native observability, automatic scaling, reduced operational overhead

### Recommended Monitoring Setup
Have a dashboard with scraper health that then sends alerts to devs when we get errors. This can then be triage and investigated/fixed. TODO: finish this section.

## TODO
- Write custom errors inside util functions so we can use these to handle retries on likely transient problems vs avoid on ones that are likely broken like selector errors.

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