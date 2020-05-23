//-----------------------------------------------------------------------------
// client/src/components/auth/SignUpForm.js
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
  confirmPassword: 
    Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
})

/**
 * Sign-in form.
 * 
 * @param {*} props 
 */
const AuthSignUpForm = (props) => {
  return (
    <Container>
      <Formik
        initialValues = {{
          email:            '',
          password:         '',
          confirmPassword:  '',
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
             isSubmitting,
             resetForm }) => (
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

              {/* Confirm Password */}
              <Form.Group controlId='confirmPassword'>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control 
                  type        = 'password'
                  placeholder = 'Confirm password'
                  name        = 'confirmPassword'
                  value       = {values.confirmPassword}
                  onChange    = {handleChange}
                  onBlur      = {handleBlur}
                  isInvalid   = {touched.confirmPassword && !!errors.confirmPassword}
                />
                <Form.Control.Feedback type='invalid' data-testid='confirm-password-error'>
                  {errors.confirmPassword ? errors.confirmPassword : null}
                </Form.Control.Feedback>
              </Form.Group>

              {/* SignUp and Cancel Buttons */}
              <Button 
                variant   = 'primary' 
                type      = 'submit' 
                style     = {{marginRight:'1.0rem'}}
                disabled  = {isSubmitting}
              >
                Sign Up
              </Button>
              <Button variant='secondary' onClick={resetForm}>
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
export default AuthSignUpForm