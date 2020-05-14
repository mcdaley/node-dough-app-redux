//-----------------------------------------------------------------------------
// client/src/components/auth/Form.js
//-----------------------------------------------------------------------------
import React                from 'react'
import { Formik }           from 'formik'
import * as Yup             from 'yup'
import {
  Container,
  Form, 
  Col,
  Button,
}                           from 'react-bootstrap'

// Define authentication validation schema
const authValidationSchema = Yup.object({
  email: 
    Yup.string()
      .email('Must be a valid email')
      .max(128, 'Email must be 128 characters or less')
      .required('Email is required'),
  password: 
    Yup.string()
      .max(128, 'Password muust be 128 characters or less')
      .required('Password is required'),
})

/**
 * Sign-in form.
 * 
 * @param {*} props 
 */
const AuthForm = (props) => {
  return (
    <Container>
      <Formik
        initialValues = {{
          email:    '',
          password: '',
        }}
        validationSchema = {authValidationSchema}
        onSubmit         = {(values, {setSubmitting, resetForm}) => {
          setSubmitting(true)

          // Callback to submit form
          props.onSubmit(values)
          
          resetForm()
          setSubmitting()

          return
        }}
      >
        {
          ({ handleSubmit,
             handleChange,
             handleBlur,
             setFieldValue,
             values,
             touched,
             errors,
             isSubmitting }) => (
            <Form noValidate onSubmit={handleSubmit} data-testid='signin-form'>
              {/* Email */}
              <Form.Group controlId='email'>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type        = 'text' 
                  autoFocus   = {true}
                  placeholder = 'Enter email'
                  name        = 'email'
                  onChange    = {handleChange}
                  onBlur      = {handleBlur}
                  value       = {values.email}
                  isInvalid   = {touched.email && !!errors.email}
                />
                <Form.Control.Feedback type='invalid' data-testid='email-error'>
                  {errors.email ? errors.email : null}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password */}
              <Form.Group controlId='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type        = 'password'
                  placeholder = 'Enter password'
                  name        = 'password'
                  value       = {values.password}
                  onChange    = {handleChange}
                  onBlur      = {handleBlur}
                  isInvalid   = {touched.password && !!errors.password}
                />
                <Form.Control.Feedback type='invalid' data-testid='password-error'>
                  {errors.password ? errors.password : null}
                </Form.Control.Feedback>
              </Form.Group>

              {/* SignIn and Cancel Buttons */}
              <Button 
                variant   = 'primary' 
                type      = 'submit' 
                style     = {{marginRight:'1.0rem'}}
                disabled  = {isSubmitting}
              >
                Sign In
              </Button>
              <Button variant='secondary' onClick={props.onClose}>
                Cancel
              </Button>
            </Form>
          )
        }
      </Formik>
    </Container>
  )
}

// Export the sign-in form
export default AuthForm