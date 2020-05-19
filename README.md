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

#### Enahancement
- Provide flash message when user's session is expired.

#### Bugs
- Need to clear out redux store when a user logs out of the application.
  * Look into adding User duck w/ sign-in and sign-out actions?
  * How do I clear state when there is a 401 error while the user is
    in the App? Clear out the state when the user signs into the app.
- Expired User creates a transaction is not redirected to the login page
  [x] * Add const [error, setError] = useState({state.transactions.byId.error})
  [x] * If the error.code = 401 then use logout user and redirect to /login
- If user deletes all of their transactions and then goes to view them then 
  the server crashes when calculating the running balance.
  * Should not calculate it if transactions = []
[x] - User w/ expired token is able to navigate to the /accounts/list page
      [x] * Logout out user if the jwt is expired in AuthAPI.isAuthenticated

#### Sign Up Form
- Form to sign up user
- Call register API to sign-up users
- Component tests
- Redirect to /login after signup?

#### Login Form
[x] - Form to login user
[x]- Call login API to login
[x] - Retrieve, parse, and store the JWT
[x] - Redirect user to /accounts page
[x] - Display error for the wrong password
- Login Form UI tests

#### Protected Routes
[x] - Add PrivateRoutes component
[x] - Update Router to use Private routes for accounts and transactions
- Test protected routes

#### Logout
[x] - Add "sign out" link that logs the user out of the system
- Update Navbar links after user signs out. Add a dropdown w/ the user's 
  email address w/ a Logout Link and add the user to the state. When a user
  clicks logout then I can clear the user from the state.

#### Navbar
- Different Navbar links if a user is authenticated
  [x] * Display Home, About, and Sign Up/Sign In links if  user is not authenticated.
  [x] * Display Dashboard, Accounts, Reports, and  Sign Out if user is authenticated.
 

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