import GraphQLJSON from 'graphql-type-json'
import shortid from 'shortid'
import { withFilter } from 'graphql-subscriptions'
const JSON = GraphQLJSON
let drawState = {}
const drawerQueries = {
  drawData: () => {
    console.log(drawState)
    return drawState
  }
}
const drawerMutations = {
  updateCanvasState: (_, { state, id }, { pubsub }) => {
    pubsub.publish('canvasState', { id, canvasUpdated: state })
    drawState = state
    return 'updated mutation!'
  }
}
const drawerSubscriptions = {
  canvasUpdated: {
    subscribe: withFilter(
      (_, __, { pubsub }) => pubsub.asyncIterator('canvasState'),
      (payload, variables) => {
        return payload.id === variables.id
      }
    )
  }
}

export { drawerQueries, drawerMutations, drawerSubscriptions }
