//-----------------------------------------------------------------------------
// client/src/components/account-form/account-form-modal.js
//-----------------------------------------------------------------------------
import React        from 'react'
import {
  Modal,
}                   from 'react-bootstrap'

import AccountForm  from './Form'

/**
 * Display a modal window the contains the form for creating new
 * accounts or for updating existing accounts.
 * 
 * @param {String}   title    - The modal title
 * @param {Function} onSubmit - Callback to save the account
 * @param {Function} onClose  - Callbacl to close the modal.
 * 
 * @return {Component} Modal window to create/edit an account.
 */
function AccountModal(props) {

  /**
   * Render the add account modal
   */
  return (
    <Modal show={props.show} onHide={props.onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AccountForm
          onSubmit  = {props.onSubmit}
          onClose   = {props.onClose}
        />
      </Modal.Body>
    </Modal>
  )
}

// Export the create account modal
export default AccountModal