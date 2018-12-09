/**
 * @prettier
 * @description: Dialog to view or generate new client secrets
 * @copyright (c) 2018 - present, HGC AB.
 * @licence This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import PropTypes from 'prop-types'

// material-ui
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import FeedbackIcon from '@material-ui/icons/Feedback'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

// custom components
import CloseButton from '../buttons/CloseButton'

import clientAPI from '../../../domain/service/Client'

/**
 * ClientSecretsDialog component
 */
class ClientSecretsDialog extends React.PureComponent {
  /**
   * Property type checks
   * @type {Object}
   */
  static propTypes = {
    /**
     * Entity object that should contain secrets
     */
    client: PropTypes.object.isRequired,
  }

  /**
   * Initial state
   * @type {Object}
   */
  state = {
    open: false,
    clientId: '',
    clientSecret: ''
  }

  handleClose = () => {
    this.setState({ open: false, clientId: '', clientSecret: '' })
  }

  handleGetSecrets = () => {
    clientAPI.findSecretsByName(this.props.client.name)
      .then(data => {
        this.setState({
          open: true,
          clientId: data.clientId ? data.clientId : '',
          clientSecret: data.clientSecret ? data.clientSecret : ''
        })
      })
      .catch(error => {
        console.log(error)
      })
  }

  handleGenerateSecrets = () => {
    clientAPI.generateSecretsByName(this.props.client.name)
      .then(data => {
        this.setState({
          open: true,
          clientId: data.clientId ? data.clientId : '',
          clientSecret: data.clientSecret ? data.clientSecret : ''
        })
      })
      .catch(error => {
        console.log(error)
      })
  }

  render() {
    return (
      <div>
        <Tooltip title="Display secrets">
          <IconButton aria-label="Display secrets" onClick={this.handleGetSecrets}>
            <FeedbackIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          fullWidth={true}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Client secrets</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Client Id and Client Secret are values you should copy and use in you own app.
              If there are no value, you could generate new values once.
            </DialogContentText>
            <TextField
              disabled
              margin="dense"
              id="clientId"
              label="Client ID"
              type="text"
              value={this.state.clientId}
              fullWidth
            />
            <TextField
              disabled
              margin="dense"
              id="clientSecret"
              label="Client Secret"
              value={this.state.clientSecret}
              type="text"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            { !this.state.clientId ? (
              <React.Fragment>
                <Button color="primary" onClick={this.handleGenerateSecrets} >
                  Generate secrets
                </Button>
                <CloseButton color='primary' variant='outlined' onClick={this.handleClose} />
              </React.Fragment>
            ) : (
              <CloseButton color='primary' variant='outlined' onClick={this.handleClose} />
            )}
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default ClientSecretsDialog