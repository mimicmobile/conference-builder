<template>
  <v-app id="inspire">
    <v-navigation-drawer
      app
      clipped
      v-if="isAdmin"
      v-model="drawer"
    >
      <v-list>
        <v-list-item to="/speakers">
          <v-list-item-action>
            <v-icon>person</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Speakers</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div v-if="isSpeakers">
          <v-chip :input-value="snapshotChipSelected(snapshot)"
                  :key="snapshot.count"
                  @click="snapshotClick('speakers', snapshot.id)"
                  class="edits-snapshots"
                  outlined
                  small v-for="snapshot in speakerSnapshots">
            {{ snapshot.date }} by {{ snapshot.author }}
          </v-chip>
        </div>
        <v-list-item to="/schedule">
          <v-list-item-action>
            <v-icon>schedule</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Schedule</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div v-if="isSchedule">
          <v-chip :input-value="snapshotChipSelected(snapshot)"
                  :key="snapshot.count"
                  @click="snapshotClick('schedule', snapshot.id)"
                  class="edits-snapshots"
                  outlined
                  small v-for="snapshot in scheduleSnapshots">
            {{ snapshot.date }} by {{ snapshot.author }}
          </v-chip>
        </div>
        <v-list-item to="/about">
          <v-list-item-action>
            <v-icon>help_outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div v-if="isAbout">
          <v-chip :input-value="snapshotChipSelected(snapshot)"
                  :key="snapshot.count"
                  @click="snapshotClick('about', snapshot.id)"
                  class="edits-snapshots"
                  outlined
                  small v-for="snapshot in aboutSnapshots">
            {{ snapshot.date }} by {{ snapshot.author }}
          </v-chip>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app clipped-left color="primary" fixed>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="isAdmin"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="authButtonClick" icon v-if="!isLoading">
        <v-icon>{{ authButton }}</v-icon>
      </v-btn>
    </v-app-bar>
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
      speakerSnapshots: [],
      scheduleSnapshots: []
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
      },
      isSchedule () {
        return this.$route.name === "Schedule"
      },
      isAdmin () {
        return this.$store.state.isAdmin
      },
      authButton () {
        return this.currentUser ? "logout" : "exit_to_app"
      }
    },
    mounted () {
      this.fetchSnapshots("about")
      this.fetchSnapshots("speakers")
      this.fetchSnapshots("schedule")
    },
    props: {
      source: String
    },
    methods: {
      authButtonClick () {
        this.currentUser ? this.logOut() : this.logIn()
      },
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
          break
        case "schedule":
          this.scheduleSnapshots = collection
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
        this.$store.commit("SET_ADMIN", false)
        this.$router.push("/")
      },
      logIn () {
        this.$router.push("/auth")
      }
    }
  }
</script>
<style>
  .edits-snapshots {
    margin: 0 10px 6px 60px;
  }

  .hide {
    display: none !important;
  }
</style>
