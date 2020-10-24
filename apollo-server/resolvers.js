import GraphQLJSON from 'graphql-type-json'
import shortid from 'shortid'
import { withFilter } from 'graphql-subscriptions'
import {
  drawerQueries,
  drawerMutations,
  drawerSubscriptions
} from './drawerResolvers.js'
export default {
  JSON: GraphQLJSON,

  Counter: {
    countStr: counter => `Current count: ${counter.count}`
  },

  Query: {
    ...drawerQueries,
    messages: (root, args, { db }) => db.get('messages').value(),
    chatRoom: (_, { id }, { db }) => {
      const chatRoom = db

        .get('chatRooms')
        .find({ id })
        .value()
      console.log('chatRoom', chatRoom)
      console.log(
        'chatRoom.messages[chatRoom.messages.length]',
        chatRoom.messages[chatRoom.messages.length - 1]
      )
      return chatRoom.messages[chatRoom.messages.length - 1] || ''
    },
    hello: (root, { name }) => `Hello ${name || 'World'}!`,
    uploads: (root, args, { db }) => db.get('uploads').value(),
    chatRooms: (root, args, { db }) => db.get('chatRooms').value()
  },

  Mutation: {
    ...drawerMutations,
    myMutation: (root, args, context) => {
      const message = 'My mutation completed!'
      context.pubsub.publish('hey', { mySub: message })
      return message
    },
    createChatRoom: (_, { userId, name }, { pubsub, db }) => {
      console.log(userId)
      const chatRoom = {
        id: shortid.generate(),
        users: [],
        messages: [],
        creator: userId,
        name
      }
      console.log(chatRoom)
      db.get('chatRooms')
        .push(chatRoom)
        .last()
        .write()
      pubsub.publish('chatRooms', { chatRoomsUpdated: chatRoom })
      return chatRoom
    },
    addChatRoomMessage: (_, { id, name, message }, { db, pubsub }) => {
      console.log('addChatRoomMessage - id', id)
      const chatRoom = db
        .get('chatRooms')
        .find({ id })
        .value()
      const userMessage = name + ': ' + message
      console.log(chatRoom)
      chatRoom.messages.push(userMessage)

      db.get('chatRooms')
        .find({ id })
        .assign({ messages: chatRoom.messages })
        .write()

      pubsub.publish('roomMessageAdded', { id, chatRoomMessage: userMessage })
      return userMessage
    },
    userJoinedRoom: (_, { id, userId, name }, { db, pubsub }) => {
      console.log('id', id)
      const chatRoom = db
        .get('chatRooms')
        .find({ id })
        .value()

      chatRoom.users.push(userId)

      const joinedMsg = `User ${name} joined the room!`
      chatRoom.messages.push(joinedMsg)
      db.get('chatRooms')
        .find({ id })
        .assign({ messages: chatRoom.messages, users: chatRoom.users })
        .write()

      pubsub.publish('roomMessageAdded', { id, chatRoomMessage: joinedMsg })
      return joinedMsg
    },
    addMessage: (root, { input }, { pubsub, db }) => {
      const message = {
        id: shortid.generate(),
        text: input.text
      }

      db.get('messages')
        .push(message)
        .last()
        .write()

      pubsub.publish('messages', { messageAdded: message })

      return message
    },

    singleUpload: (root, { file }, { processUpload }) => processUpload(file),
    multipleUpload: (root, { files }, { processUpload }) =>
      Promise.all(files.map(processUpload))
  },

  Subscription: {
    ...drawerSubscriptions,
    mySub: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('hey')
    },
    counter: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random()
          .toString(36)
          .substring(2, 15) // random channel name
        let count = 0
        setInterval(
          () =>
            pubsub.publish(channel, {
              // eslint-disable-next-line no-plusplus
              counter: { count: count++ }
            }),
          2000
        )
        return pubsub.asyncIterator(channel)
      }
    },
    chatRoomsUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('chatRooms')
    },
    chatRoomMessage: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator('roomMessageAdded'),
        (payload, variables) => {
          return payload.id === variables.id
        }
      )
    },
    messageAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('messages')
    }
  }
}
