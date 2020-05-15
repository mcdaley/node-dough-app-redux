# Dough App

## ToDo

### User Authentication
Add user authentication to the react client.

#### authAPI
[x] - register API
[x] - login API
  [x] * Retrieve and parse JWT from response
  [x] * Store JWT and user info in local storage or cookies
[x] - Add authService to handle sign-up, sign-in, and isAuthenticated?
[x] - API tests
  [x] * register
  [x] * login

#### Sign Up Form
- Form to sign up user
- Call register API to sign-up users
- Component tests
- Login user after sign-up

#### Login Form
[x] - Form to login user
[x]- Call login API to login
[x] - Retrieve, parse, and store the JWT
- Redirect user to /accounts page
- Display error for the wrong password

#### Protected Routes
[x] - Add PrivateRoutes component
[x] - Update Router to use Private routes for accounts and transactions
- Test protected routes

#### Logout
- Add "sign out" link that logs the user out of the system
 

## Overview
Dough is a replica of Quicken written w/ the MERN stack. The goal of the project is to learn the following:

- Building website w/ Express and Node.js
  * Testing controllers

- Building NoSQL DB w/ MongoDB
  * Learn a little about NoSQL DB design
  * Testing DB models

- Building UI w/ React
  * Material Design styles
  * Testing components
  * Mocking asynchronous requests for tests

## User Stories

### 404 Route
Add a route that handles 404 requests, the following article has info on how to log with morgan and winston:

[How to use Winston to Log Node.js Applications](https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications)

### Add a User
[x] I want to be able to create a user account that has my name, email, and mobile number.

### Add a Financial Account
[x] As a User, I want to be able to create a banking/credit card account so that I can track my finances.

### Add a Transaction
[x] As a User, I want to be able to add transactions to my Financial Accounts so that I can track all of my spending.

### Switch Environments
[x] As a Developer, I want to be able to configure different environments, so that I can seemlessly switch between development, testing, and production.