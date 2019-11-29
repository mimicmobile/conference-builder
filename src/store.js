import Vuex from "vuex"
import Vue from "vue"

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  state: {
    currentUser: null,
    isLoading: true,
    darkTheme: true,
    isAdmin: false
  },
  mutations: {
    SET_CURRENT_USER (state, user) {
      state.currentUser = user
    },
    SET_ADMIN (state, toggle) {
      state.isAdmin = toggle
    },
    SET_LOADING (state, loading) {
      state.isLoading = loading
    },
    SET_DARK_THEME (state, toggle) {
      state.darkTheme = toggle
      localStorage.setItem("DARK_THEME", toggle)
    }
  }
})
