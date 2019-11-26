<template>
  <v-container class="pt-5" v-if="isLoading">
    <v-layout justify-center>
      <v-progress-circular
        :indeterminate="true"
        color="accent"
      ></v-progress-circular>
    </v-layout>
  </v-container>
  <v-container text-xs-center v-else>
    <form v-on:change="changed">
      <v-row>
        <v-col cols="12">
          <v-card text>
            <v-row :key="talkKey" class="pa-5 schedule-group-item" v-for="talkKey in sortedTalks()">
              <v-col cols="12">{{ talkKey }}</v-col>
              <v-col :key="talk.track" cols="12" lg="6" v-for="talk in talks[talkKey]">
                <v-card @click="editTalk(talk.datetime, talk.trackId)" class="speaker-card">
                  <v-card-title class="talk-title">
                    {{ talk.title }}
                  </v-card-title>
                  <v-row class="ma-3 pb-3" no-gutters v-if="talk.speakerIds.length > 0">
                    <v-col class="speaker-avatars text-center">
                      <v-avatar :key="speakerId" size="70px" v-for="speakerId in talk.speakerIds">
                        <img :alt="findSpeaker(speakerId).text" :src="findSpeaker(speakerId).imagePath"/>
                      </v-avatar>
                    </v-col>
                    <v-col class="px-3" cols="8">
                      <v-col class="speaker-names-title pa-1" cols="12">
                        {{ speakerNames(talk.speakerIds) }}
                      </v-col>
                      <v-col class="speaker-companies-title pa-1" cols="12">
                        {{ speakerCompanies(talk.speakerIds) }}
                      </v-col>
                      <v-col class="track-title pa-1" cols="12">
                        {{ talkTrackName(talk.trackId) }}
                      </v-col>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
            <v-col class="text-center" cols="12" wrap :class="{ hide: readOnly }">
              <v-btn @click="showNewTalkDialog" color="accent" rounded>
                <v-icon small>add</v-icon>
                Add new talk
              </v-btn>
            </v-col>
          </v-card>
        </v-col>
        <v-dialog fullscreen v-model="newTalkDialog">
          <v-card color="primary">
            <v-card-title>
              <span class="headline">{{ editTalkTitle(newTalkDate, newTalkTime) }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row justify="space-between">
                  <v-row v-if="!readOnly">
                    <v-col lg="6" md="12">
                      <v-date-picker label="Select Date" v-model="newTalkDate"></v-date-picker>
                    </v-col>
                    <v-col lg="6" md="12">
                      <v-time-picker label="Select Time" v-model="newTalkTime"></v-time-picker>
                    </v-col>
                  </v-row>
                  <v-col cols="12" v-if="newTalkSpeakerIds.length >= 1 && readOnly || !readOnly">
                    <v-select :readonly="readOnly" :items="speakers" :label="editTalkSpeakers"
                              multiple v-model="newTalkSpeakerIds">
                      <template slot="item" slot-scope="speaker">
                        <v-avatar size="45px" tile>
                          <img :src="speaker.item.imagePath"/>
                        </v-avatar>
                        <span class="selected-speaker-name ml-2">
                          {{ speaker.item.text }}
                          </span>
                      </template>
                      <template slot="selection" slot-scope="speaker">
                        <v-col cols="12">
                          <v-avatar size="50px">
                            <img :src="speaker.item.imagePath"/>
                          </v-avatar>
                          <span class="selected-speaker-name ml-2">
                          {{ speaker.item.text }}
                          </span>
                        </v-col>
                      </template>
                    </v-select>
                  </v-col>
                  <v-col class="mr-auto" cols="12">
                    <v-text-field v-if="!readOnly" class="talk-title" label="Title" required
                                  v-model="newTalkTitle"></v-text-field>
                    <span v-else class="talk-title">{{ newTalkTitle }}</span>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea class="talk-description" :full-width="readOnly" :readonly="readOnly" :auto-grow="true"
                                label="Description"
                                required v-model="newTalkDescription"></v-textarea>
                  </v-col>
                  <v-col cols="12" lg="6">
                    <v-select :readonly="readOnly" :items="talkTypes" item-text="name" item-value="id"
                              label="Type of talk" required
                              v-model="newTalkTypeId"></v-select>
                  </v-col>
                  <v-col cols="12" lg="6" v-if="displayEditTracks(newTalkTrackId)">
                    <v-select :readonly="readOnly" :items="talkTracks" item-text="name" item-value="id" label="Track"
                              required
                              v-model="newTalkTrackId"></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="newTalkDialog = false" color="secondary darken-1" text>Close</v-btn>
              <v-btn :hidden="readOnly" :disabled="!validNewTalk" @click="addNewTalk" color="secondary darken-1" text>
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
      </v-row>
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
      newTalkDate: null,
      newTalkTime: null,
      newTalkTitle: null,
      newTalkDescription: null,
      newTalkTrackId: null,
      newTalkTypeId: null,
      newTalkSpeakerIds: [],
      newTalkDialog: false,
      talks: {},
      speakers: [],
      speakerRef: null,
      talkTypes: [],
      talkTracks: []
    }),
    computed: {
      readOnly () {
        return this.$route.meta.readOnly
      },
      validNewTalk () {
        return this.newTalkTitle != null &&
          this.newTalkDescription != null &&
          this.newTalkDate != null &&
          this.newTalkTime != null &&
          this.newTalkTypeId != null
      },
      addOrSaveTalk () {
        return this.newTalkIndex != null ? "Save" : "Add"
      },
      editTalkSpeakers () {
        return this.readOnly ? "" : "Speakers"
      }
    },
    methods: {
      editTalkTitle (talkDate, talkTime) {
        return !this.readOnly ? "Add a new talk" : talkDate + " @ " + talkTime
      },
      showNewTalkDialog () {
        this.newTalkDate = null
        this.newTalkTime = null
        this.newTalkTitle = null
        this.newTalkDescription = null
        this.newTalkTrackId = null
        this.newTalkTypeId = null
        this.newTalkSpeakerIds = []
        this.newTalkIndex = null
        this.newTalkDialog = true
      },
      addNewTalk () {
        const update = {
          datetime: `${this.newTalkDate} ${this.newTalkTime}`,
          time: this.newTalkTime,
          date: this.newTalkDate,
          title: this.newTalkTitle,
          description: this.newTalkDescription,
          trackId: this.newTalkTrackId,
          typeId: this.newTalkTypeId,
          speakerIds: this.newTalkSpeakerIds
        }

        if (!(update.datetime in this.talks)) {
          this.talks[update.datetime] = {}
        }

        let originalIndexDateTime
        let originalTrackId = null

        if (this.newTalkIndex != null) {
          try {
            console.log(this.newTalkIndex)
            originalIndexDateTime = this.newTalkIndex.split(" ").slice(0, 2).join(" ")
            originalTrackId = this.newTalkIndex.split(" ")[2]
          } catch (err) {
            originalIndexDateTime = this.newTalkIndex.split(" ").splice(0, 1)
          }

          // Clean up
          delete this.talks[originalIndexDateTime][originalTrackId]
          if (update.datetime !== originalIndexDateTime && Object.keys(this.talks[originalIndexDateTime]).length === 0) {
            delete this.talks[originalIndexDateTime]
          }
        }
        if (this.talks[update.datetime][this.newTalkTrackId] != null) {
          // Check if talk already exists in this slot w/ this track
          this.talks[update.datetime][null] = this.talks[update.datetime][this.newTalkTrackId]
          this.talks[update.datetime][this.newTalkTrackId].trackId = null
        }
        this.talks[update.datetime][this.newTalkTrackId] = update

        this.newTalkDialog = false
        this.changed()
      },
      editTalk (datetime, trackId) {
        const talk = this.talks[datetime][trackId]

        this.newTalkIndex = `${datetime} ${trackId}`
        this.newTalkTime = talk.time
        this.newTalkDate = talk.date
        this.newTalkTitle = talk.title
        this.newTalkDescription = talk.description
        this.newTalkTrackId = talk.trackId
        this.newTalkTypeId = talk.typeId
        this.newTalkSpeakerIds = talk.speakerIds
        this.newTalkDialog = true
      },
      deleteTalk (datetime, trackId) {
        delete this.talks[datetime][trackId]
        this.changed()
      },
      findSpeaker (id) {
        let speaker = this.speakers.find(e => e.value === id)
        if (speaker === undefined) {
          return { text: "", value: "", company: "" }
        }
        return speaker
      },
      speakerNames (speakerIds) {
        return speakerIds.map(e => this.findSpeaker(e).text).join(", ")
      },
      speakerCompanies (speakerIds) {
        return speakerIds.map(e => this.findSpeaker(e).company).join(", ")
      },
      talkTrackName (trackId) {
        if (trackId == null) return ""
        try {
          return this.talkTracks.find(e => e.id === trackId).name
        } catch (err) {
          return ""
        }
      },
      sortedTalks () {
        return Object.keys(this.talks).sort()
      },
      save () {
        const update = {
          talks: this.talks,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          speakerRef: this.speakerRef,
          talkTypes: this.talkTypes,
          talkTracks: this.talkTracks,
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
        console.log(d)
        let talkTracks = this.talkTracks = d.talkTracks || []
        let talkTypes = this.talkTypes = d.talkTypes || []
        this.speakerRef = d.speakerRef || null

        firebase.firestore().collection("speakers")
          .orderBy("created", "desc")
          .limit(1)
          .get()
          .then((speakers) => this.loadSpeakers(speakers.docs[0]))

        if (talkTypes.length === 0) {
          this.talkTypes = [
            {
              "id": "technical",
              "name": "Technical",
              "material_icon": "grade",
              "description": "This talk is considered technical"
            },
            {
              "id": "room",
              "name": "Whole Room",
              "material_icon": "all_inclusive",
              "description": "This talk is can be enjoyed by everyone"
            },
            {
              "id": "security",
              "name": "Security",
              "material_icon": "security",
              "description": "This talk is focused on security"
            },
            {
              "id": "fun",
              "name": "Fun",
              "material_icon": "tag_faces",
              "description": "This talk is for fun"
            },
            {
              "id": "registration",
              "name": "Registration",
              "material_icon": "android",
              "description": "Welcome to the party pal"
            },
            {
              "id": "lunch",
              "name": "Lunch",
              "material_icon": "restaurant",
              "description": "Time for lunch"
            },
            {
              "id": "party",
              "name": "Party",
              "material_icon": "cake",
              "description": "After party"
            },
            {
              "id": "break",
              "name": "Break",
              "material_icon": "free_breakfast",
              "description": "Time for a break!"
            }]
          if (talkTracks.length === 0) {
            this.talkTracks = [
              {
                "id": "main",
                "name": "Main",
                "color": "#F0BD35"
              },
              {
                "id": "track1",
                "name": "Track 1",
                "color": "#CC6666"
              },
              {
                "id": "track2",
                "name": "Track 2",
                "color": "#B5BD68"
              }]
          }
        }
        this.talks = d.talks || {}
      },
      loadSpeakers (snap) {
        this.speakers = []
        snap.data().speakers.forEach((speaker) => {
          this.speakers.push({
            "text": speaker.name,
            "value": speaker.id,
            "imagePath": speaker.imagePath,
            "company": speaker.company
          })
        })
        this.speakerRef = snap.id
      },
      displayEditTracks (talkTracks) {
        if (this.readOnly) {
          return talkTracks
        }
        return true
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
  .selected-speaker-name {
    font-size: 18px;
  }

  .talk-title {
    word-break: break-word;
    font-size: 28px;
  }

  .talk-description {
    font-size: 14px;
  }

  .speaker-card {
    background-color: #555555;
  }

  .speaker-names-title {
    font-size: 22px;
    color: #fff;
  }

  .speaker-companies-title {
    font-size: 18px;
    color: #ddd;
  }

  .track-title {
    font-size: 18px;
    color: #aaa;
  }
</style>
