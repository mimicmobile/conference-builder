import Vue from "vue"
import Vuetify from "vuetify/lib"
import "vuetify/src/stylus/app.styl"
import { Ripple } from "vuetify/lib/directives"

Vue.use(Vuetify, {
  theme: {
    primary: "#728DFF",
    secondary: "#9f68e3",
    accent: "#f44336",
    error: "#f44336",
    warning: "#ffeb3b",
    info: "#2196f3",
    success: "#4caf50"
  },
  directives: {
    Ripple
  }
})
