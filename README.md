# Horse Racing Odds Scraper API

A Node.js/TypeScript application that scrapes horse racing odds from bookmaker websites using Puppeteer and exposes them via a RESTful API. 

The webscraper can be used independently of the API via the CLI as explained in the usage guide.

## Quick Start: How to Run Guide

### Prerequisites

- **Node.js**: Version 20.0.0 or higher
- **npm**: Latest version (comes with Node.js)
- **Git**: For cloning the repository

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/jkcswd/Horse-Racing-Odds-Scraper-API.git
cd Horse-Racing-Odds-Scraper-API

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### 2. Configure Environment

Edit the `.env` file with your settings:

```bash
# Required - Generate a secure JWT secret
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Optional - Customize other settings
PORT=3000
NODE_ENV=development
PUPPETEER_HEADLESS=true
```

### 3. Build the Project

```bash
# Compile TypeScript to JavaScript
npm run build
```

### 4. Generate a JWT Token (Required for API Access)

```bash
# Generate a test JWT token for authentication
npm run generate-token
```

**Copy the generated token** - you'll need it for API requests.

### 5. Start the Server

```bash
# Production mode (compiled JavaScript)
npm start

# OR Development mode (with hot reload)
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### 6. Test the API

#### Using curl:
```bash
# Replace YOUR_JWT_TOKEN with the token from step 4
curl -X POST "http://localhost:3000/api/odds" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventUrl": "https://www.ladbrokes.com.au/sports/racing/horse-racing/..."
  }'
```

### 7. CLI Usage (Alternative to API)

You can also use the scraper directly via CLI without running the server:

```bash
# Scrape odds directly from command line
npm run cli -- -u "https://www.ladbrokes.com.au/sports/racing/horse-racing/..."
```

### Testing

```bash
# Run all tests
npm test
```

## Features

-  Scrape horse racing odds from bookmaker websites in real-time
-  JWT-based authentication
-  Synchronous response (no queuing needed)
-  RESTful API with proper error handling
-  CLI interface for standalone scraping on a local machine

## Assumptions Made and Design Choices
### Cloud Provider
I use AWS services as examples but we can switch these services for equivalents on other providers.

### Validation
The validation on input needed is very minimal in this use case so I did not use any libraries but in a production environment with more complex input into or out of the API I would use the Zod validation library.

### Auth
We only need a key to verify the ability to access for now. We don't need granular permissions on the JWT. We could expand later with granular permissions if the requirements change.

I only implemented minimal auth as I do not know the full auth requirements currently. I would also expand the security tests as I only added one type of common attack but would need to research more.

### Anti Detection Settings 
I have not applied any anti bot detection configurations (apart from sensible viewport and user agent) as running locally we are not likely to run in to these issues. I have built the code so that it can be extended with proxies or even a hosted browser configured to avoid bot detection. There are further tools we can implement like making the headless browsers behavior more human through natural mouse movements, visiting other pages on the website and interacting with them. However even in production we should not spend time implementing solutions that are not yet needed or likely to be needed to keep in line with principles of YAGNI and KISS.

### Browser Pooling
I have not implemented proper browser pooling this for this use case but in production we could pool and manage browsers using p-queue or similar if on an EC2. 

However, if on AWS lambdas we could pool and manage browsers separately to the lambdas although it is also not awful to just spin up a new browser in each lambda instance as the compute costs are not usually the bottleneck for cost (that is proxies) and the websites themselves are usually the bottleneck for performance. This would also allow us to easily handle using a new proxy on each connection which is sometimes needed. 

We could also create a browser pool in an EC2 and connect to it with the lambdas with 'puppeteer.connect' if we want to pool browsers on AWS lambdas. I would also need to research this more to understand the feasibility and trade offs of pooling browsers on aws lambda as this may not be a good idea in general as it eats in to the benefits of serverless.

### Using Puppeteer 
As the requirements specify using Puppeteer, I will implement the solution accordingly. However, sometimes it is very easy to implement a curl + HTML parser solution. I have only investigated ladbrookes and that website in particular seems to be easier to scrape using puppeteer although other websites may have more easily accessible APIs which would lend themselves to using fetch in the code.

### Deployment Architecture Implementation Approach
For these requirements, unless otherwise specified, a serverless implementation would be optimal for development speed, maintenance, and cost efficiency. However, I have chosen to deploy this on an express server for ease of local development and displaying my understanding of creating an API which can be easily run and tested by anyone.

### No Redis Caching/Database Storage
Horse racing odds change every few seconds during live events. Caching would provide stale data that could be misleading or financially dangerous for users making betting decisions. Real-time accuracy is more valuable than performance optimization.

However, if we wanted to provide analytical insights, we could store the results in a time series database (either in a pure timeseries DB like Cassandra or InfluxDB, or a standard relational DB like PostgreSQL). This would enable analysis of how odds change over time, identify patterns, and provide historical data for analysis. I would however assume that the team consuming this API would take care of that themselves.

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

### Automated vs Manual QA and Test
For web scrapers due to the nature of the system interacting with the outside world and constantly changing automated unit tests are not generally that good. Instead very good logging and monitoring systems should be used so that we can find any failures quickly and fix them. However, transforms on the data afterwards can be unit tested.

For the API I added unit where possible to help me find cases I had not thought about when coding it and to prevent regressions by future contributors and myself as I refactor code.

### Non Runners
I found 'non runners' on the ladbrokes website. A lot of the time these do have odds but I would need to verify what the requirements are but I have created code to filter them out. This is signposted and can be removed or adapted to add a flag to the output data structure as I would assume that the consumers of the API might need the non runners odds but also have it flagged that they are non runners.

###  Output Validation
I would talk to the end users of the API and find out further requirements for the odds types and output structure required. For example do they need odds in a specific format (2/1 or 2:1)? I would then use Zod or similar to validate the output structure and write code to transform data into the required format with unit tests on the transform.

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
Have a dashboard with scraper health that then sends alerts to devs when we get errors that are expected to be non-transient (like the SelectorNotFoundError after page has loaded properly and not thrown a PageLoadError which could be transient) or consitstently getting transient errors on a specific url e.g 100% of errors on ladbrookes are the page not loading this would indicate we are being blocked or the site is down or url structure has changed. This can then be triage and investigated/fixed. Can use cloudwatch only but paid for monitoring services are generally better.
