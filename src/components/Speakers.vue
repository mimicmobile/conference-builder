<template>
  <v-container class="pt-5" v-if="isLoading">
    <v-row justify-center>
      <v-progress-circular
        :indeterminate="true"
        color="accent"
      ></v-progress-circular>
    </v-row>
  </v-container>
  <v-container v-else>
    <form v-on:change="changed">
      <v-row wrap>
        <v-col cols="12">
          <v-card text>
            <v-col cols="12" class="speaker-group" v-if="speakers.length > 0" wrap>
              <v-col xs="6" md="6" lg="3" :key="speaker.name" class="speaker-group-item"
                     v-for="(speaker, index) in speakers">
                <a :href="speaker.imagePath" target="_blank"><img :src="speaker.imagePath" alt/></a>
                <span>{{ speaker.name }}</span>
                <span>{{ speaker.company }}</span>
                <v-col class="speaker-links-cont">
                  <a v-if="speaker.twitter" :href="speaker.twitter" class="fab fa-twitter"></a>
                  <a v-if="speaker.linkedIn" :href="speaker.linkedIn" class="fab fa-linkedin"></a>
                  <a v-if="speaker.github" :href="speaker.github" class="fab fa-github"></a>
                </v-col>
                <v-row class="speaker-group-button-cont" wrap>
                  <v-btn @click="editSpeaker(index)" color="secondary" rounded small>
                    <v-icon small>edit</v-icon>
                    &nbsp;
                    Edit
                    &nbsp;
                  </v-btn>
                  <v-btn @click="deleteSpeaker(index)" color="secondary" rounded small>
                    <v-icon small>delete</v-icon>
                    &nbsp;
                    Delete
                    &nbsp;
                  </v-btn>
                </v-row>
              </v-col>
            </v-col>
            <v-col class="text-center" cols="12" wrap>
              <v-btn @click="showNewSpeakerDialog" color="accent" rounded>
                <v-icon small>add</v-icon>
                Add new speaker
              </v-btn>
            </v-col>
          </v-card>
        </v-col>
        <v-dialog max-width="800px" v-model="newSpeakerDialog">
          <v-card>
            <v-card-title>
              <span class="headline">Add a new speaker</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row wrap>
                  <v-col cols="12" lg="6">
                    <v-text-field label="Name" required v-model="newSpeakerName"></v-text-field>
                  </v-col>
                  <v-col cols="12" lg="6">
                    <v-text-field label="Company" required v-model="newSpeakerCompany"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea label="Bio" required v-model="newSpeakerBio"></v-textarea>
                  </v-col>
                  <v-col cols="12" class="upload-image">
                    <div class="upload-image-cont">
                      <img :src="newSpeakerImageOrPlaceholder" alt/>
                      <div class="upload-image-text-cont">
                        <v-progress-circular color="accent" indeterminate
                                             v-if="isNewSpeakerImageLoading"></v-progress-circular>
                      </div>
                    </div>
                    <v-btn class="ml-3 mt-3" color="accent" rounded @click="clickUpload('imageUpload')">
                      <v-icon small>add</v-icon>
                      Set speaker image
                    </v-btn>
                    <v-file-input class="hide" id="imageUpload" @change="updateNewSpeakerImage"></v-file-input>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field append-icon="fab fa-twitter" label="Twitter"
                                  v-model="newSpeakerTwitter"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field append-icon="fab fa-linkedin" label="LinkedIn"
                                  v-model="newSpeakerLinkedIn"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field append-icon="fab fa-github" label="Github"
                                  v-model="newSpeakerGithub"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="newSpeakerDialog = false" color="secondary darken-1" text>Close</v-btn>
              <v-btn :disabled="!validNewSpeaker" @click="addNewSpeaker" color="secondary darken-1" text>
                {{ addOrSaveSpeaker }}
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
      speakerDeleted: false,
      newSpeakerIndex: null,
      newSpeakerName: null,
      newSpeakerBio: null,
      newSpeakerImagePath: null,
      newSpeakerCompany: null,
      newSpeakerTwitter: null,
      newSpeakerLinkedIn: null,
      newSpeakerGithub: null,
      newSpeakerDialog: false,
      newSpeakerId: null,
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
        this.newSpeakerId = null
        this.newSpeakerDialog = true
      },
      addNewSpeaker () {
        const update = {
          name: this.newSpeakerName,
          bio: this.newSpeakerBio,
          imagePath: this.newSpeakerImagePath,
          company: this.newSpeakerCompany,
          twitter: this.newSpeakerTwitter,
          linkedIn: this.newSpeakerLinkedIn,
          github: this.newSpeakerGithub,
          id: this.newSpeakerId
        }

        if (this.newSpeakerIndex != null) {
          this.speakers[this.newSpeakerIndex] = update
        } else {
          update["id"] = this.createId()
          this.speakers.push(update)
        }

        this.newSpeakerDialog = false
        this.changed()
      },
      editSpeaker (index) {
        const speaker = this.speakers[index]

        this.newSpeakerIndex = index
        this.newSpeakerId = speaker.id
        this.newSpeakerName = speaker.name
        this.newSpeakerBio = speaker.bio
        this.newSpeakerCompany = speaker.company
        this.newSpeakerTwitter = speaker.twitter || null
        this.newSpeakerLinkedIn = speaker.linkedIn || null
        this.newSpeakerGithub = speaker.github || null
        this.newSpeakerImagePath = speaker.imagePath
        this.newSpeakerDialog = true
      },
      deleteSpeaker (index) {
        this.speakers.splice(index, 1)
        this.speakerDeleted = true
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
            if (!this.speakerDeleted && !this.snapshotIsOld) {
              // Update schedule speaker snapshot ref
              firebase.firestore().collection("schedule")
                .orderBy("created", "desc")
                .limit(1)
                .get().then((e) => {
                  let schedule = e.docs[0].data()
                  schedule["speakerRef"] = this.currentId
                  schedule["created"] = firebase.firestore.FieldValue.serverTimestamp()
                  schedule["author"] = {
                    displayName: firebase.auth().currentUser.displayName,
                    uid: firebase.auth().currentUser.uid
                  }

                  firebase.firestore().collection("schedule").add(schedule).then(() => {
                    console.log("Updated schedule with new snapshot")
                  })
                })
            } else {
              // TODO alert user to update schedule
              console.log("Schedule still using old speaker snapshot reference")
            }

            this.speakerDeleted = false
          })
      },
      updateState (d) {
        this.speakers = d.speakers || []
      },
      updateNewSpeakerImage (file) {
        this.updateImage(file, "speakers/", "newSpeakerImagePath", "isNewSpeakerImageLoading")
      }
    },
    mounted () {
      firebase.firestore().collection("speakers")
        .orderBy("created", "desc")
        .limit(6)
        .onSnapshot((speakerCollection) => this.loadCollection(speakerCollection))
    }
  }
</script>

<style scoped>
  .speaker-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, 240px);
    grid-row-gap: 20px;
    justify-content: space-around;
  }

  .speaker-group-item {
    max-width: 320px;
    display: flex;
    flex-flow: column;
    flex-basis: available;
    text-align: start;
    margin: 10px;
  }

  .speaker-group-item img {
    width: 100%;
    height: auto;
  }

  .speaker-group-item span {
    font-size: 14pt;
    padding: 4px;
  }

  .speaker-group-button-cont {
    justify-content: space-evenly;
  }

  .upload-image {
    display: flex;
    flex-flow: row;
    align-items: center;
    flex-wrap: wrap;
  }

  .upload-image-cont {
    width: 260px;
    height: auto;
    min-height: 50%;
    min-width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-color: #CCC;
    border-width: 2px;
    border-style: solid;
    border-radius: 4px;
  }

  .upload-image-text-cont {
    width: auto;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
  }

  .upload-image div:hover {
    border-color: #FFF;
  }

  .upload-image img {
    width: 100%;
    height: 100%;
  }

  .fab {
    margin-right: 20px;
    text-decoration: none;
  }

</style>
