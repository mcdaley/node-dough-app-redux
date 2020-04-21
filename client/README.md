# Dough Money

## APIs

### Account APIs

#### GET /api/v1/accounts
Return an array w/ all of the user's accounts/

#### GET /api/v1/accounts/:id

#### POST /api/v1/accounts

#### PUT /api/v1/accounts/:id

#### DELETE /api/v1/accounts/:id

## Application Architecture

### Models
Overview of the DB models

#### Account
```
{
  name: {
    description:  'Account nickname',
    type:         'String',
    required:     true,
    
  },
  financialInstitute: {
    description:  'Name of the FI where the account is located',
    type:         String,
    required:     true,
  },
  type: {
    description:  'Type of the account',
    type:         'String',
    enum:         ['Checking', 'Savings', 'Credit Card'],
    default:      'Checking',
    required:     true,
  },
  balance: {
    description:  'Current account balance'
    type:         Number,
    default:      0
  },
  asOfDate: {
    description:  'Date for the current balance'
    note:         'RENAME INITIAL DATE TO ASOFDATE',
    type:         Date,
    default:      new Date(),
  }
  userId: {
    description:  'Reference to user that owns the account'
    type:         mongoose.Schema.Types.ObjectId,
    required:     true,
  }
}
```

#### Transaction
```
{
  description: {
    description:  'Transaction payor or payee',
    type:         'String',
    required:     true,
  },
  date: {
    description:  'Date of transaction',
    type:         Date,
    default:      new Date(),
  },
  category: {
    description:  'Transaction classification used for reporting',
    type:         'String',
    default:      '',
  },
  amount: {
    description:  'Amount of the transaction',
    type:         Number,
    default:      0.00
  },
  accountId: {
    description:  'Foreign key to account',
    type:         'mongoose.Schema.Types.ObjectId',
    required:     true,
  },
  userId: {
    description:  'Foreign key to user',
    type:         mongoose.Schema.Types.ObjectId,
    required:     true,
  }
}
```

#### User

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
