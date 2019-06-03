import VueRouter from "vue-router"
import Auth from "./components/Auth.vue"

import store from "./store"
import Home from "./components/Home"
import Speakers from "./components/Speakers"
import Schedule from "./components/Schedule"
import About from "./components/About"

const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: Home, meta: { name: "Home" } },
    { path: "/speakers", component: Speakers, meta: { name: "Speakers" } },
    { path: "/schedule", component: Schedule, meta: { name: "Schedule" } },
    { path: "/about", component: About, meta: { name: "About" } },
    { path: "/auth", component: Auth, meta: { name: "Auth" } }
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
