<template>
  <v-container class="pt-5" v-if="isLoading">
    <v-layout justify-center>
      <v-progress-circular
        color="accent"
        indeterminate
      ></v-progress-circular>
    </v-layout>
  </v-container>
  <v-container grid-list-md text-xs-center v-else>
    <form v-on:change="changed">
      <v-layout wrap>
        <v-flex class="py-3" xs12>
          <div class="header-image-cont">
            <img :src="header_image" alt class="header-image" v-if="header_image"/>
            <div class="header-text-cont">
              <span v-if="!header_image">&lt; Header Placeholder &gt;</span>
              <v-progress-circular class="header-progress" color="accent" indeterminate
                                   v-if="isHeaderLoading"></v-progress-circular>
            </div>
          </div>
          <upload-btn @file-update="update" color="accent" noTitleUpdate round
                      title="Set header image">
            <template slot="icon-left">
              <v-icon>add</v-icon>
            </template>
          </upload-btn>
        </v-flex>
        <v-flex class="py-3 px-3" xs12>
          <v-textarea auto-grow box label="Conference description" v-model="description"></v-textarea>
        </v-flex>
        <v-flex class="py-3 px-3" md6 xs12>
          <v-text-field append-icon="fab fa-twitter" box label="Twitter" v-model="twitter"></v-text-field>
        </v-flex>
        <v-flex class="py-3 px-3" md6 xs12>
          <v-text-field append-icon="fas fa-code" box label="Website" v-model="website"></v-text-field>
        </v-flex>
        <v-flex class="py-3 px-3" md6 xs12>
          <v-text-field append-icon="email" box label="Email" v-model="contact_email"></v-text-field>
        </v-flex>
        <v-snackbar :timeout="timeout" absolute color="primary" v-model="isModified">
          Modified
          <v-btn @click="save" color="transparent">
            <span>Save</span>
            <v-icon>save</v-icon>
          </v-btn>
        </v-snackbar>
        <v-snackbar absolute color="primary" v-model="currentIdUpdated">
          This page has been updated by another user!
        </v-snackbar>
        <v-snackbar :timeout="timeout" absolute color="primary" v-model="snapshotIsOld">
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

  export default {
    data: () => ({
      timeout: 0,
      isLoading: true,
      isHeaderLoading: false,
      header_image: false,
      description: null,
      twitter: null,
      website: null,
      contact_email: null,
      venue: {
        name: null,
        address: null,
        image_path: null
      },
      currentId: null,
      currentIdUpdated: false,
      modified: false,
      lastChangeState: null,
      currentState: null,
      snapshotIsOld: false
    }),
    computed: {
      isModified () {
        return this.modified && !this.snapshotIsOld
      }
    },
    methods: {
      save () {
        let update = {
          header_image: this.header_image,
          description: this.description,
          twitter: this.twitter,
          website: this.website,
          contact_email: this.contact_email,
          venue: this.venue,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          author: {
            displayName: firebase.auth().currentUser.displayName,
            uid: firebase.auth().currentUser.uid
          }
        }

        this.modified = false
        this.snapshotIsOld = false
        // this.$router.replace("/about")
        this.$route.query.id = null
        window.history.pushState({}, "About", "/" + window.location.href.substring(window.location.href.lastIndexOf("/") + 1).split("?")[0])

        firebase.firestore().collection("about").add(update).then((ref) => {
          this.currentId = ref.id
        })
      },
      changed () {
        this.modified = true
      },
      updateState (d) {
        this.header_image = d.header_image
        this.description = d.description
        this.twitter = d.twitter
        this.website = d.website
        this.contact_email = d.contact_email
        this.venue = d.venue
      },
      update (file) {
        let d = this
        this.isHeaderLoading = true

        firebase.storage().ref().child(`images/${file.name}`).put(file).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            d.header_image = url
            d.isHeaderLoading = false

            this.changed()
          })
        })
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
      console.log("test")
      firebase.firestore().collection("about").orderBy("created", "desc").limit(10).onSnapshot((aboutCollection) => {
        this.currentIdUpdated = false

        if (!aboutCollection.empty) {
          let loadedId = this.$route.query.id
          let wantedSnapshot = null
          this.snapshotIsOld = false

          wantedSnapshot = aboutCollection.docs[0]
          if (loadedId !== null) {
            aboutCollection.forEach((snap) => {
              if (snap.id === loadedId) {
                wantedSnapshot = snap
              }
            })
          }

          this.snapshotIsOld = wantedSnapshot.id !== aboutCollection.docs[0].id
          this.loadSnapshot(wantedSnapshot)
        }

        this.isLoading = false
      })
    },
    components: {
      "upload-btn": UploadButton
    }
  }
</script>

<style scoped>
  .header-image-cont {
    width: auto;
    height: auto;
    min-height: 100px;
    min-width: 800px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }

  .header-image-cont span {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .header-text-cont {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
  }

  .header-image {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 300px;
  }
</style>
