import Vue from 'vue'
import Vuex from 'vuex'
import shortid from 'shortid'
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {
      name: 'Anonymous',
      id: shortid.generate()
    }
  },
  mutations: {
    login: (state, user) => (state.user = user)
  },
  actions: {},
  getters: {},
  modules: {}
})

export default store
