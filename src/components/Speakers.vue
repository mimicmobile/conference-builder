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
            <v-flex class="speaker-group" v-if="speakers.length > 0" wrap xs12>
              <v-flex :key="speaker.name" class="speaker-group-item" lg3 md6 v-for="(speaker, index) in speakers" xs6>
                <a :href="speaker.imagePath" target="_blank"><img :src="speaker.imagePath" alt/></a>
                <span>{{ speaker.name }}</span>
                <span><a :href="speaker.company" target="_blank">{{ speaker.company }}</a></span>
                <div class="speaker-group-button-cont">
                  <v-btn @click="editSpeaker(index)" color="secondary" round small>
                    <v-icon small>edit</v-icon>
                    &nbsp;
                    Edit speaker
                    &nbsp;
                  </v-btn>
                  <v-btn @click="deleteSpeaker(index)" color="secondary" round small>
                    <v-icon small>delete</v-icon>
                    &nbsp;
                    Delete speaker
                    &nbsp;
                  </v-btn>
                </div>
              </v-flex>
            </v-flex>
            <v-flex wrap xs12>
              <v-btn @click="showNewSpeakerDialog" color="accent" round>
                <v-icon small>add</v-icon>
                Add new speaker
              </v-btn>
            </v-flex>
          </v-card>
        </v-flex>
        <v-dialog max-width="800px" v-model="newSpeakerDialog">
          <v-card>
            <v-card-title>
              <span class="headline">Add a new speaker</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex lg6 xs12>
                    <v-text-field label="Name" required v-model="newSpeakerName"></v-text-field>
                  </v-flex>
                  <v-flex xs12>
                    <v-textarea label="Bio" required v-model="newSpeakerBio"></v-textarea>
                  </v-flex>
                  <v-flex lg6 xs12>
                    <v-textarea label="Company" required v-model="newSpeakerCompany"></v-textarea>
                  </v-flex>
                  <v-flex class="pb-3 upload-image" lg12 xs12>
                    <div class="upload-image-cont">
                      <img :src="newSpeakerImageOrPlaceholder" alt/>
                      <div class="upload-image-text-cont">
                        <v-progress-circular color="accent" indeterminate
                                             v-if="isNewSpeakerImageLoading"></v-progress-circular>
                      </div>
                    </div>
                    <upload-btn @file-update="updateNewSpeakerImage" class="upload-image-btn" color="accent"
                                noTitleUpdate
                                round title="Set image">
                      <template slot="icon-left">
                        <v-icon small>add</v-icon>
                      </template>
                    </upload-btn>
                  </v-flex>
                  <v-flex class="pb-3" md6 xs12>
                    <v-text-field append-icon="fab fa-twitter" label="Twitter"
                                  v-model="newSpeakerTwitter"></v-text-field>
                  </v-flex>
                  <v-flex class="pb-3" md6 xs12>
                    <v-text-field append-icon="fab fa-linkedin" label="LinkedIn"
                                  v-model="newSpeakerLinkedIn"></v-text-field>
                  </v-flex>
                  <v-flex class="pb-3" md6 xs12>
                    <v-text-field append-icon="fab fa-github" label="Github"
                                  v-model="newSpeakerGithub"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="newSpeakerDialog = false" color="secondary darken-1" flat>Close</v-btn>
              <v-btn :disabled="!validNewSpeaker" @click="addNewSpeaker" color="secondary darken-1" flat>{{
                addOrSaveSpeaker }}
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

  import UploadButton from "vuetify-upload-button"

  import { commonMixin } from "../mixins"

  function getPlaceholderImage (dimension) {
    return `https://via.placeholder.com/${dimension}/454545/454545`
  }

  export default {
    name: "Speakers",
    mixins: [commonMixin],
    props: ["loadedId"],
    beforeRouteUpdate (to, from, next) {
      this.loadId("speakers")
      next()
    },
    data: () => ({
      isNewSpeakerImageLoading: false,
      newSpeakerIndex: null,
      newSpeakerName: null,
      newSpeakerBio: null,
      newSpeakerImagePath: null,
      newSpeakerCompany: null,
      newSpeakerTwitter: null,
      newSpeakerLinkedIn: null,
      newSpeakerGithub: null,
      newSpeakerDialog: false,
      speakers: []
    }),
    computed: {
      newSpeakerImageOrPlaceholder () {
        return this.newSpeakerImagePath || getPlaceholderImage("600x260")
      },
      validNewSpeaker () {
        return this.newSpeakerName != null && this.newSpeakerBio != null && this.newSpeakerImagePath != null && this.newSpeakerCompany != null
      },
      addOrSaveSpeaker () {
        return this.newSpeakerIndex != null ? "Save" : "Add"
      }
    },
    methods: {
      showNewSpeakerDialog () {
        this.newSpeakerName = null
        this.newSpeakerBio = null
        this.newSpeakerImagePath = null
        this.newSpeakerCompany = null
        this.newSpeakerTwitter = null
        this.newSpeakerLinkedIn = null
        this.newSpeakerGithub = null
        this.newSpeakerDialog = true
      },
      addNewSpeaker () {
        const update = {
          name: this.newSpeakerName,
          bio: this.newSpeakerBio,
          imagePath: this.newSpeakerImagePath,
          company: this.newSpeakerCompany,
          twitter: this.newSpeakerBio,
          linkedIn: this.newSpeakerLinkedIn,
          github: this.newSpeakerGithub
        }

        if (this.newSpeakerIndex != null) {
          this.speakers[this.newSpeakerIndex] = update
        } else {
          this.speakers.push(update)
        }

        this.newSpeakerDialog = false
        this.changed()
      },
      editSpeaker (index) {
        const speaker = this.speakers[index]

        this.newSpeakerIndex = index
        this.newSpeakerName = speaker.name
        this.newSpeakerBio = speaker.bio
        this.newSpeakerCompany = speaker.company
        this.newSpeakerTwitter = speaker.twitter
        this.newSpeakerLinkedIn = speaker.linkedIn
        this.newSpeakerImagePath = speaker.imagePath
        this.newSpeakerDialog = true
      },
      deleteSpeaker (index) {
        this.speakers.splice(index, 1)
        this.changed()
      },
      save () {
        const update = {
          speakers: this.speakers,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          author: {
            displayName: firebase.auth().currentUser.displayName,
            uid: firebase.auth().currentUser.uid
          }
        }

        this.resetRoute("speakers")

        firebase.firestore().collection("speakers")
          .add(update)
          .then((ref) => {
            this.currentId = ref.id
          })
      },
      updateState (d) {
        this.speakers = d.speakers || []
      },
      updateNewSpeakerImage (file) {
        this.updateImage(file, "speakers/", "newSpeakerImagePath", "isNewSpeakerImageLoading")
      },
      loadSnapshot (snap) {
        if (this.currentId !== null && this.currentId !== snap.id && this.modified) {
          this.currentIdUpdated = true
          this.modified = false
          // TODO: If modified, alert user, offer to switch them
        }
        this.currentId = snap.id
        this.updateState(snap.data())
      }
    },
    mounted () {
      firebase.firestore().collection("speakers")
        .orderBy("created", "desc")
        .limit(6)
        .onSnapshot((speakerCollection) => this.loadCollection(speakerCollection))
    },
    components: {
      "upload-btn": UploadButton
    }
  }
</script>

<style scoped>

</style>
