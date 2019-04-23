/**
 * @prettier
 * @description: ClientPage
 * @copyright (c) 2018 - present, HGC AB.
 * @licence This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

// Custom components
import Form from '../components/schemaform/Form'
import TabsNavigator from '../components/navigator/TabsNavigator'
import ToolbarActions from '../components/toolbars/ToolbarActions'

// context providers
import FormProvider from '../providers/FormProvider'

// Action creators used to update clients store
import clientActions from '../../store/actions/ClientActions'
import clientSchema from '../../domain/entity/schemas/client'

/**
 * ClientPage
 */
class ClientPage extends React.PureComponent {
  static propTypes = {
    /**
     * Selected client
     */
    selectedClient: PropTypes.object.isRequired,
    /**
     * Clients array
     */
    clients: PropTypes.array.isRequired,
    /**
     * Action creators
     */
    actions: PropTypes.object.isRequired,
  }

  /**
   * Fetch clients by query params
   */
  componentDidMount() {
    this.props.actions.findClientsByQuery({ page: 0, sort: 'name' })
  }

  /**
   * Event handler for input elements onChange event
   * Update entered value in global state
   * @param prop
   * @param value
   */
  handleChange = (prop, value) => {
    let updatedClient = { ...this.props.selectedClient }
    updatedClient[prop] = value
    this.props.actions.updateClientState(updatedClient)
  }

  /**
   * Create a new or update services
   * If the services has an _id prop it should be updated otherwise it is a new services
   */
  handleSubmit = () => {
    if (this.props.selectedClient._id) {
      this.props.actions.updateClient()
    } else {
      this.props.actions.createClient()
    }
  }

  /**
   * Reset selected services
   */
  handleReset = () => {
    this.props.actions.resetSelectedClient()
  }

  /**
   * Remove services
   */
  handleRemove = () => {
    this.props.actions.removeClient()
  }

  handleSelect = (event, value) => {
    const { clients } = this.props
    const selectedClient = clients.filter(client => client._id === value)
    this.props.actions.setSelectedClient(...selectedClient)
  }

  /**
   * Render component
   * @returns {*}
   */
  render() {
    return (
      <React.Fragment>
        <TabsNavigator
          variant="dense"
          items={this.props.clients}
          selectedItem={this.props.selectedClient}
          onChange={this.handleSelect}
        />
        <ToolbarActions entity={this.props.selectedClient} />
        <FormProvider
          formLabel="Client"
          entity={this.props.selectedClient}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
          onRemove={this.handleRemove}
          onReset={this.handleReset}
          schema={clientSchema}
        >
          <Form />
        </FormProvider>
      </React.Fragment>
    )
  }
}

/**
 * Map clients state to props
 * @param state
 * @returns {{selectedClient: *, clients: Array}}
 */
function mapStateToProps(state) {
  return {
    selectedClient: state.clients.entity,
    clients: state.clients.entities
  }
}

/**
 * Map actions creators to actions prop
 * @param dispatch
 * @returns {{actions: ({findClientsByQuery, createClient, updateClient, removeClient, setSelectedClient, updateClientState, resetSelectedClient}|ActionCreator<any>|ActionCreatorsMapObject<any>)}}
 */
function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(clientActions, dispatch) }
}


// Inject state and action creators to presentation layer
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClientPage)
