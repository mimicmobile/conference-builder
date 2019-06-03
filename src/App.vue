<template>
  <v-app id="inspire" dark>
    <v-navigation-drawer
      v-model="drawer"
      clipped
      fixed
      app
    >
      <v-list dense>
        <v-list-tile to="/">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Hello</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile v-if="currentUser" @click="logOut">
          <v-list-tile-action>
            <v-icon>logout</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Logout ({{ currentUser.displayName }})</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left color="primary">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>GDG Toronto - {{ $route.meta.name }}</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container class="pt-5" v-if="isLoading">
        <v-layout justify-center>
          <v-progress-circular
            color="accent"
            :indeterminate="true"
          ></v-progress-circular>
        </v-layout>
      </v-container>
      <router-view v-else></router-view>
    </v-content>
  </v-app>
</template>

<script>
  import firebase from "firebase/app"
  import "firebase/auth"

  export default {
    data: () => ({
      drawer: null
    }),
    computed: {
      currentUser() {
        return this.$store.state.currentUser
      },
      isLoading() {
        return this.$store.state.isLoading && this.$route.path !== "/auth"
      },
    },
    props: {
      source: String
    },
    methods: {
      logOut() {
        firebase.auth().signOut()
      }
    }
  }
</script>

