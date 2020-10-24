<template>
  <div class="about">
    <div>
      <div class="create-room">
        <h2>Create chat room</h2>

        <ApolloMutation
          :mutation="require('../graphql/room/CreateChatRoom.gql')"
          :variables="{
            userId: user.id,
            name: roomName
          }"
          @done="user.username = ''"
        >
          <template slot-scope="{ mutate, error }">
            <label for="roomName"> <b>room name:</b> </label>
            <input type="text" id="roomName" v-model="roomName" />
            <button @click="mutate()">Create chat room</button>
            <p v-if="error">{{ error }}</p>
          </template>
        </ApolloMutation>
      </div>
      <RandomUserLogin />
    </div>
    <div class="chat-rooms">
      <h2>chat rooms</h2>
      <ApolloQuery :query="require('../graphql/room/ChatRooms.gql')">
        <ApolloSubscribeToMore
          :document="require('../graphql/room/ChatRoomsUpdated.gql')"
          :update-query="onChatRoomsUpdated"
        />

        <div slot-scope="{ result: { data } }">
          <template v-if="data">
            <div
              class="rooms"
              v-for="room of data.chatRooms"
              :key="room.id"
              @click="enterRoom(room.id)"
            >
              <p>
                <b>
                  ID: <span>{{ room.id }}</span>
                </b>
              </p>
              <p><b>Room name: </b> {{ room.name }}</p>
              <p><b>creator:</b> {{ room.creator }}</p>
            </div>
          </template>
        </div>
      </ApolloQuery>
    </div>
  </div>
</template>

<script>
import RandomUserLogin from '@/components/RandomUserLogin'
import { mapState } from 'vuex'
export default {
  components: { RandomUserLogin },
  data() {
    return {
      roomName: ''
    }
  },
  methods: {
    onChatRoomsUpdated(previousResult, { subscriptionData }) {
      console.log('onRoomCreated -> subscriptionData', subscriptionData)
      console.log('onRoomCreated -> previousResult', previousResult)
      return {
        chatRooms: [
          ...previousResult.chatRooms,
          subscriptionData.data.chatRoomsUpdated
        ]
      }
    },
    enterRoom(roomId) {
      console.log('enterRoom -> roomId', roomId)
      this.$router.push('/drawer/' + roomId)
    }
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>

<style scoped>
.about {
  display: flex;
  justify-content: center;
}
.create-room {
  height: 100px;
  margin-right: 40px;
}
.create-room * {
  margin-right: 10px;
}
.create-room,
.chat-rooms {
  border: 1px solid black;
  width: 500px;
}

.chat-rooms h2 {
  border-bottom: 2px solid black;
  padding: 20px;
  margin: 0;
}
.rooms {
  border-bottom: 1px solid black;
  cursor: pointer;
  padding: 20px;
}
.rooms:hover {
  background-color: rgba(47, 47, 47, 0.164);
}
p span {
  color: blueviolet;
}
</style>
