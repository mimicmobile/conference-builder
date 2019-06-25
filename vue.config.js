const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin")
module.exports = {
  configureWebpack: {
    plugins: [
      new VuetifyLoaderPlugin()
    ]
  },
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    disableHostCheck: true
  }
}
