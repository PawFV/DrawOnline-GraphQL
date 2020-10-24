<template>
  <div class="ChatRoom">
    <h2>Room: {{ $route.params.id }}</h2>

    <div class="messages">
      <ApolloQuery
        :query="require('../graphql/ChatRoom.gql')"
        :variables="{ id: $route.params.id }"
      >
        <ApolloSubscribeToMore
          :document="require('../graphql/ChatRoomMessage.gql')"
          :variables="{ id: $route.params.id }"
          :updateQuery="onChatRoomMessage"
        />
      </ApolloQuery>
      <div>
        <p v-for="(message, index) of messages" :key="index">{{ message }}</p>
      </div>
    </div>
    <div class="send-message">
      <ApolloMutation
        :mutation="require('../graphql/AddChatRoomMessage.gql')"
        :variables="{
          id: $route.params.id,
          name: $store.state.user.name,
          message: userMessage
        }"
        @done="userMessage = ''"
      >
        <template slot-scope="{ mutate, error }">
          <label for="message" />
          <input
            type="text"
            name="message"
            id="message"
            v-model="userMessage"
          />
          <button @click="mutate()"><b>Send</b></button>
          <p v-if="error">{{ error }}</p>
        </template>
      </ApolloMutation>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatRoom',
  data() {
    return {
      messages: [],
      userMessage: ''
    }
  },
  mounted() {
    this.$apollo
      .mutate({
        mutation: require('../graphql/UserJoinedRoom.gql'),
        variables: {
          id: this.$route.params.id,
          userId: this.$store.state.user.id,
          name: this.$store.state.user.name
        }
      })
      .then(({ data }) => console.log(data.userJoinedRoom))
  },
  methods: {
    onChatRoomMessage(previousResult, { subscriptionData }) {
      console.log('onChatRoomMessage -> subscriptionData', subscriptionData)
      this.messages.push(subscriptionData.data.chatRoomMessage)
      return {
        data: [previousResult.chatRoom, subscriptionData.data.chatRoomMessage]
      }
    }
  }
}
</script>

<style scoped>
.ChatRoom {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 500px;
  height: 500px;
  border: 1px solid black;
}
.messages {
  border-top: 1px solid black;
  height: 100%;
}
.send-message {
  padding: 20px;
  border-top: 1px solid black;
}
input {
  margin-right: 10px;
}
</style>
