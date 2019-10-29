<template>
  <v-container class="pt-5" v-if="isLoading">
    <v-layout justify-center>
      <v-progress-circular
        :indeterminate="true"
        color="accent"
      ></v-progress-circular>
    </v-layout>
  </v-container>
  <v-container grid-list-md text-xs-center v-else>
    <form v-on:change="changed">
      <v-layout wrap>
        <v-flex class="py-3" xs12>
          <v-card flat>
            <v-flex class="schedule-group" v-if="talks.length > 0" wrap xs12>
              <v-flex :key="talk.name" class="schedule-group-item" lg3 md6 v-for="(talk, index) in schedule"
                      xs6>
              </v-flex>
            </v-flex>
            <v-flex wrap xs12>
              <v-btn @click="showNewTalkDialog" color="accent" round>
                <v-icon small>add</v-icon>
                Add new talk
              </v-btn>
            </v-flex>
          </v-card>
        </v-flex>
        <v-dialog max-width="800px" v-model="newTalkDialog">
          <v-card>
            <v-card-title>
              <span class="headline">Add a new talk</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <!-- Speaker (select) -->
                  <v-flex lg6 xs12>
                    <v-text-field label="Title" required v-model="newTalkTitle"></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-textarea label="Description" required v-model="newTalkDescription"></v-textarea>
                  </v-flex>
                  <!-- Type (select) -->
                  <!-- Track (combobox) -->
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="newTalkDialog = false" color="secondary darken-1" flat>Close</v-btn>
              <v-btn :disabled="!validNewTalk" @click="addNewTalk" color="secondary darken-1" flat>
                {{ addOrSaveTalk }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-snackbar :timeout="timeout" color="primary" v-model="isModified">
          Modified
          <v-btn @click="save" color="transparent">
            <span>Save</span>
            <v-icon>save</v-icon>
          </v-btn>
        </v-snackbar>
        <v-snackbar color="primary" v-model="currentIdUpdated">
          This page has been updated by another user!
        </v-snackbar>
        <v-snackbar :timeout="timeout" color="primary" v-model="snapshotIsOld">
          You are viewing an old revision
          <v-btn @click="save" color="transparent">
            <span>Save as new</span>
            <v-icon>save</v-icon>
          </v-btn>
        </v-snackbar>
      </v-layout>
    </form>
  </v-container>
</template>

<script>
  import firebase from "firebase/app"
  import "firebase/storage"
  import "firebase/firestore"

  import { commonMixin } from "../mixins"

  export default {
    name: "Schedule",
    mixins: [commonMixin],
    props: ["loadedId"],
    beforeRouteUpdate (to, from, next) {
      this.loadId("schedule")
      next()
    },
    data: () => ({
      newTalkIndex: null,
      newTalkTitle: null,
      newTalkDescription: null,
      newTalkTrackId: null,
      newTalkTypeId: null,
      newTalkSpeakerId: null,
      newTalkDialog: false,
      talks: []
    }),
    computed: {
      validNewTalk () {
        return this.newTalkTitle != null && this.newTalkDescription != null
      },
      addOrSaveTalk () {
        return this.newTalkIndex != null ? "Save" : "Add"
      }
    },
    methods: {
      showNewTalkDialog () {
        this.newTalkTitle = null
        this.newTalkDescription = null
        this.newTalkTrackId = null
        this.newTalkTypeId = null
        this.newTalkSpeakerId = null
        this.newTalkDialog = true
      },
      addNewTalk () {
        const update = {
          title: this.newTalkTitle,
          description: this.newTalkDescription,
          trackId: this.newTalkTrackId,
          typeId: this.newTalkTypeId,
          speakerId: this.newTalkSpeakerId
        }

        if (this.newTalkIndex != null) {
          this.talks[this.newTalkIndex] = update
        } else {
          this.talks.push(update)
        }

        this.newTalkDialog = false
        this.changed()
      },
      editTalk (index) {
        const talk = this.talks[index]

        this.newTalkIndex = index
        this.newTalkTitle = talk.title
        this.newTalkDescription = talk.description
        this.newTalkTrackId = talk.trackId
        this.newTalkTypeId = talk.typeId
        this.newTalkSpeakerId = talk.speakerId
        this.newTalkDialog = true
      },
      deleteTalk (index) {
        this.talks.splice(index, 1)
        this.changed()
      },
      save () {
        const update = {
          talks: this.talks,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          author: {
            displayName: firebase.auth().currentUser.displayName,
            uid: firebase.auth().currentUser.uid
          }
        }

        this.resetRoute("schedule")

        firebase.firestore().collection("schedule")
          .add(update)
          .then((ref) => {
            this.currentId = ref.id
          })
      },
      updateState (d) {
        // {"time": "10:00am", "talks": []}
        // schedule["time"] = []
        // List:
        //    - Get keys
        //    - Splkit
        this.talks = d.talks || []
      }
    },
    mounted () {
      firebase.firestore().collection("schedule")
        .orderBy("created", "desc")
        .limit(6)
        .onSnapshot((schedule) => this.loadCollection(schedule))
    }
  }
</script>

<style scoped>

</style>
