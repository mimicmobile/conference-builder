import VueRouter from "vue-router"
import Auth from "./components/Auth.vue"

import store from "./store"
import Speakers from "./components/Speakers"
import Schedule from "./components/Schedule"
import About from "./components/About"

const router = new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: Schedule, name: "Schedule" },
    { path: "/speakers/:loadedId?", component: Speakers, name: "Speakers", props: true },
    { path: "/schedule/:loadedId?", component: Schedule, name: "Schedule", props: true },
    { path: "/about/:loadedId?", component: About, name: "About", props: true },
    { path: "/auth", component: Auth, name: "Auth" }
  ]
})

router.beforeEach((to, from, next) => {
  if (store.state.currentUser === null && to.path !== "/") {
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
