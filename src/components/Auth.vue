<template lang="html">
  <div id="firebaseui-auth-container"></div>
</template>

<script>
  import firebaseui from "firebaseui"
  import firebase from "firebase/app"
  import "firebase/auth"

  export default {
    name: "auth",
    mounted() {
      let uiConfig = {
        signInSuccessUrl: "/",
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ]
      }
      let ui = new firebaseui.auth.AuthUI(firebase.auth())
      ui.start("#firebaseui-auth-container", uiConfig)
    },
  }
</script>

<style>
  @import "../../node_modules/firebaseui/dist/firebaseui.css";

  .firebaseui-container {
    background-color: transparent;
    color: rgba(255, 255, 255, 0.00) !important;
  }

  .mdl-shadow--2dp {
    box-shadow: none;
  }

  .firebaseui-info-bar {
    margin-top: 20px;
  }

  div.mdl-progress::after {
    display: block;
    color: white;
    content: "Authenticating...";
    margin: 20px auto;
    text-align: center;
  }

  .mdl-progress {
    height: 5px;
  }
</style>
