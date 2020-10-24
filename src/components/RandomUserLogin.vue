<template>
  <div class="RandomUser">
    <h2>random login</h2>
    <label for="username"><b>username:</b></label>
    <input type="text" name="username" id="username" v-model="user.name" />
    <button @click="login">Login</button>
  </div>
</template>

<script>
import shortid from 'shortid'
export default {
  name: 'RandomUser',
  data() {
    return {
      user: {
        id: shortid.generate(),
        name: 'Anonymous'
      }
    }
  },
  methods: {
    login() {
      this.user.id = shortid.generate()
      this.$store.commit('login', this.user)
    }
  }
}
</script>

<style scoped>
.RandomUser {
  border: 1px solid black;
  padding-bottom: 20px;
  width: 500px;
  margin-top: 30px;
}
.RandomUser * {
  margin-right: 10px;
}
</style>
