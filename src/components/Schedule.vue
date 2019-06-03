<template>
  <v-container class="pt-5" v-if="isLoading">
    <v-layout justify-center>
      <v-progress-circular
        :indeterminate="true"
        color="accent"
      ></v-progress-circular>
    </v-layout>
  </v-container>
  <v-container v-else>
    <v-layout justify-center>
    </v-layout>
  </v-container>
</template>

<script>
  import firebase from "firebase/app"
  import "firebase/firestore"

  let db
  export default {
    data: () => ({}),
    mounted () {
      db = firebase.firestore()
    }
  }
</script>

<style scoped>

</style>
