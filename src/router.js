import VueRouter from "vue-router"
import Auth from "./components/Auth.vue"

import store from "./store"
import Hello from "./components/Hello"

const router = new VueRouter({
  mode: "history",
  routes: [
    {path: "/", component: Hello, meta: {name: "Hello World"}},
    {path: "/auth", component: Auth, meta: {name: "Auth"}}
  ]
})

router.beforeEach((to, from, next) => {
  if (store.state.currentUser === null) {
    if (to.path === "/auth" || store.state.isLoading) {
      next()
    } else {
      next("/auth")
    }
  } else {
    next()
  }
})

export default router
