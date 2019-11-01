import Vue from "vue"
import Vuetify from "vuetify/lib"
import { Ripple } from "vuetify/lib/directives"

Vue.use(Vuetify)

const opts = {
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: "#728DFF",
        secondary: "#9f68e3",
        accent: "#f44336",
        error: "#f44336",
        warning: "#ffeb3b",
        info: "#2196f3",
        success: "#4caf50",
        cards: "#4caf50"
      }
    }
  },
  directives: {
    Ripple
  }
}

export default new Vuetify(opts)
