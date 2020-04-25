//-----------------------------------------------------------------------------
// client/src/components/account-form/account-form-modal.js
//-----------------------------------------------------------------------------
import React        from 'react'
import {
  Modal,
}                   from 'react-bootstrap'
import PropTypes    from 'prop-types'

import AccountForm  from './Form'

/**
 * Display a modal window the contains the form for creating new
 * accounts or for updating existing accounts.
 * 
 * @prop {String}   title    - The modal title
 * @prop {Boolean}  show     - Flag to display/hide modal.
 * @prop {Function} onSubmit - Callback to save the account
 * @prop {Function} onClose  - Callbacl to close the modal.
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

// Prop-Types
AccountModal.propTypes = {
  title:      PropTypes.string.isRequired,
  show:       PropTypes.bool.isRequired,
  onSubmit:   PropTypes.func.isRequired,
  onClose:    PropTypes.func.isRequired,
}

// Export the create account modal
export default AccountModal