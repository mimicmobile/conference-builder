<template>
  <v-app dark id="inspire">
    <v-navigation-drawer
      app
      clipped
      fixed
      v-model="drawer"
    >
      <v-list dense>
        <v-list-tile to="/speakers">
          <v-list-tile-action>
            <v-icon>person</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Speakers</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <div v-if="isSpeakers">
          <v-chip :key="snapshot.count"
                  :selected="snapshotChipSelected(snapshot)"
                  @click="snapshotClick('speakers', snapshot.id)"
                  class="edits-snapshots"
                  outline
                  small v-for="snapshot in speakerSnapshots">
            {{ snapshot.date }} by {{ snapshot.author }}
          </v-chip>
        </div>
        <v-list-tile to="/schedule">
          <v-list-tile-action>
            <v-icon>schedule</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Schedule</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/about">
          <v-list-tile-action>
            <v-icon>help_outline</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>About</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <div v-if="isAbout">
          <v-chip :key="snapshot.count"
                  :selected="snapshotChipSelected(snapshot)"
                  @click="snapshotClick('about', snapshot.id)"
                  class="edits-snapshots"
                  outline
                  small v-for="snapshot in aboutSnapshots">
            {{ snapshot.date }} by {{ snapshot.author }}
          </v-chip>
        </div>
        <v-divider></v-divider>
        <v-list-tile @click="logOut" v-if="currentUser">
          <v-list-tile-action>
            <v-icon>logout</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Logout ({{ currentUser.displayName }})</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app clipped-left color="primary" fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container class="pt-5" v-if="isLoading">
        <v-layout justify-center>
          <v-progress-circular
            :indeterminate="true"
            color="accent"
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

  function getDigits (i, joinStr) {
    for (let j = 0; j < i.length; j++) {
      i[j] = getDigit(i[j])
    }
    return i.join(joinStr)
  }

  function getDigit (digit) {
    if (parseInt(digit) < 10) digit = "0" + parseInt(digit)
    return digit
  }

  function getMMDDHHMM (date) {
    return getDigits([date.getMonth() + 1, date.getDate()], "/") + " " + getDigits([date.getHours(), date.getMinutes()], ":")
  }

  export default {
    data: () => ({
      drawer: null,
      aboutSnapshots: [],
      speakerSnapshots: []
    }),
    computed: {
      currentUser () {
        return this.$store.state.currentUser
      },
      isLoading () {
        return this.$store.state.isLoading && this.$route.path !== "/auth"
      },
      isAbout () {
        return this.$route.name === "About"
      },
      isSpeakers () {
        return this.$route.name === "Speakers"
      }
    },
    mounted () {
      this.fetchSnapshots("about")
      this.fetchSnapshots("speakers")
    },
    props: {
      source: String
    },
    methods: {
      snapshotClick (collectionName, id) {
        this.$router.push({ path: "/" + collectionName + "/" + id, params: { "loadedId": id } })
      },
      snapshotChipSelected (snapshot) {
        return (this.$route.params.loadedId == null && snapshot.count === 0) || this.$route.params.loadedId === snapshot.id
      },
      saveSnapshots (collectionName, collection) {
        switch (collectionName) {
        case "about":
          this.aboutSnapshots = collection
          break
        case "speakers":
          this.speakerSnapshots = collection
        }
      },
      fetchSnapshots (collectionName) {
        firebase.firestore().collection(collectionName).orderBy("created", "desc").limit(5).onSnapshot((fetched) => {
          let collection = []
          let count = 0

          fetched.forEach((snap) => {
            if (snap.data().created !== null) {
              collection.push({
                "author": snap.data().author.displayName.split(" ")[0],
                "date": getMMDDHHMM(snap.data().created.toDate()),
                "count": count,
                "id": snap.id
              })
              count++
            }
          })
          this.saveSnapshots(collectionName, collection)
        })
      },
      logOut () {
        firebase.auth().signOut()
      }
    }
  }
</script>
<style>
  .edits-snapshots {
    margin: 0 10px 6px 60px;
  }
</style>
