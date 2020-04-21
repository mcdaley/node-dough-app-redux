//-----------------------------------------------------------------------------
// client/src/api/schema.js
//-----------------------------------------------------------------------------
import { schema } from 'normalizr'

const account = new schema.Entity('accounts', {}, { idAttribute: '_id' })
export const accountsSchema = { accounts: [account] };

