# instantbet-BE

This README is general overview of whole app including all related microservices.
instantbet-BE contains general overview of whole BE App.

Available microservices:

1. https://github.com/data-spartan/instantbet-scraper
2. https://github.com/data-spartan/instantbet-account
3. https://github.com/data-spartan/instantbet-BE

#### ABOUT:

InstantBet is a nodejs backend app for a real-time sports betting(e.g BWIN), made with Nestjs.

- instantbet-BE is real-time sports betting data feed hub which is responsible for processing and storing matches, markets, statistics and routing to appropriate services.

### Features Overview:

- Websockets enables real-time sports betting - **in progress**
- Kafka which enables scalable, failsafe and extremely fast data exchange between services
- Dead letter queue(Kafka) for extremely sensitive failed data actions(payments, resolving markets ...) - **in progress**
- Mongodb enables seamless and fast storage of nested JSON betting data such as matches, markets and statistics.
- RBAC based Authorization and Authentication with rotating refresh token, ES256 token signing algorithm with pub/priv keys and email verification using Postgres DB
- Redis cache emailToken, refresh tokens for Auth service
- Placing live bets, complete resolving betting logic and payment service - **in progress**
- Redis Pub/Sub enables notification to web-socket-live-feed of newly/updated arrived live betting data and emitting to all subscribed clients - **in progress**
- Notification service consisting of phone and email notifications using Twilio and Nodemailer respectively - **in progress**
- Winston Logger
- Sentry integration - **in progress**

### Architecture diagram:

![Diagram](/public/Instantbet-arh-diagram.drawio.png)

- KAFKA in this context is actually kafka cluster with mutliple brokers
- AuthGuard is simplistic overview showing how tokens are validated between microservices using public key.
- Email-Service sends verification emails with email-token to the user. As we all know, user clicks on verify-email link and its redirected to the FE route for email verification.
- Twilio-Service sends sms to the users which tickets are won. Used fire-forget approach.
- For the time being Admin-Service is included in Auth-Account-Service.

## Installation:

Steps and commands will variate between microservices. This is only general overview.

### Step 1

Clone the repository from GitHub(): https://github.com/data-spartan/instantbet-BE
You will need node v18.18.0, npm, @nestjs/cli, docker and docker-compose installed on your machine.

All commands should be run inside of the container which can be accessed by running ./bin/container from the root

### Step 2

When inside the container, run the following npm commands:

to create a database

`$ npm db:create`

run migrations:

`$ npm db:migrate`

run seeders:

`$ npm db:seed`

### Step 3

The web app should be available at localhost:3000

## Testing

- **in progress**

## Deployment

- **in progress**

## Naming conventions

Branches should be named as following: feature/IB-BE-14-implements-readme, in this example IB-BE stands for InstantBet(app name) and BE is core service name, 14 is the number of the ticket on Trello and after that is a short description. Commit messages should this format: feat/[IB-BE-14] Implements README.md file.
