import Vue from "vue"
import App from "./App.vue"

import VueRouter from "vue-router"

import "firebase/auth"
import firebase from "firebase/app"

import router from "./router"
import { config } from "./firebaseConfig"

import vuetify from "./plugins/vuetify"

import store from "./store"

Vue.config.productionTip = false

Vue.use(VueRouter)

new Vue({
  router,
  vuetify,
  store: store,
  created () {
    firebase.initializeApp(config)
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        // this.$router.push("/")
        this.$store.commit("SET_CURRENT_USER", null)
      } else {
        this.$store.commit("SET_CURRENT_USER", { "displayName": user.displayName })
        user.getIdTokenResult(true).then((e) => {
          this.$store.commit("SET_ADMIN", e.claims["admin"])
        })
      }
      this.$store.commit("SET_LOADING", false)
    })
  },
  render: h => h(App)
}).$mount("#app")
