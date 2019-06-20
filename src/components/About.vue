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
              <v-progress-circular color="accent" indeterminate v-if="isHeaderLoading"></v-progress-circular>
            </div>
          </div>
          <upload-btn @file-update="updateHeaderImage" color="accent" noTitleUpdate round
                      title="Set header image">
            <template slot="icon-left">
              <v-icon>add</v-icon>
            </template>
          </upload-btn>
        </v-flex>

        <v-flex class="pb-3" xs12>
          <v-textarea auto-grow label="Conference description" outline v-model="description"></v-textarea>
        </v-flex>
        <v-flex class="pb-3" md6 xs12>
          <v-text-field append-icon="fab fa-twitter" label="Twitter" outline v-model="twitter"></v-text-field>
        </v-flex>
        <v-flex class="pb-3" md6 xs12>
          <v-text-field append-icon="fas fa-code" label="Website" outline v-model="website"></v-text-field>
        </v-flex>
        <v-flex class="pb-3" md6 xs12>
          <v-text-field append-icon="email" label="Email" outline v-model="contact_email"></v-text-field>
        </v-flex>

        <v-flex class="py-3" text-xs-left xs12>
          <span class="title font-weight-light">Venue</span>
        </v-flex>

        <v-flex class="pb-3" md6 xs12>
          <v-text-field append-icon="fas fa-marker" label="Name" outline v-model="venue.name"></v-text-field>
        </v-flex>
        <v-flex class="pb-3" md6 xs12>
          <v-text-field append-icon="fas fa-building" label="Address" outline v-model="venue.address"></v-text-field>
        </v-flex>
        <v-flex class="pb-3 venue-image" md6 xs12>
          <div class="venue-image-cont">
            <img :src="venue.image_path" alt/>
            <div class="venue-text-cont">
              <v-progress-circular color="accent" indeterminate v-if="isVenueImageLoading"></v-progress-circular>
            </div>
          </div>
          <upload-btn @file-update="updateVenueImage" class="venue-image-btn" color="accent" noTitleUpdate
                      round title="Set venue image">
            <template slot="icon-left">
              <v-icon>add</v-icon>
            </template>
          </upload-btn>
        </v-flex>

        <v-flex class="py-3" text-xs-left xs12>
          <span class="title font-weight-light">Links</span>
        </v-flex>

        <v-flex class="py-3" xs12>
          <v-card flat>
            <v-card-title>
              <span class="title font-weight-light">Group name</span>
            </v-card-title>
          </v-card>
        </v-flex>

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

  export default {
    name: "About",
    props: ["loadedId"],
    beforeRouteUpdate (to, from, next) {
      this.loadId()
      next()
    },
    data: () => ({
      timeout: 0,
      isLoading: true,
      isHeaderLoading: false,
      isVenueImageLoading: false,
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
      loadId () {
        firebase.firestore().collection("about")
          .orderBy("created", "desc")
          .limit(6)
          .get()
          .then((aboutCollection) => this.loadCollection(aboutCollection))
      },
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

        this.resetRoute()

        firebase.firestore().collection("about")
          .add(update)
          .then((ref) => {
            this.currentId = ref.id
          })
      },
      resetRoute () {
        this.modified = false
        this.snapshotIsOld = false
        this.$router.replace("/about")
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
      updateHeaderImage (file) {
        let d = this
        this.isHeaderLoading = true

        firebase.storage().ref().child(`images/${file.name}`)
          .put(file)
          .then((snapshot) => {
            snapshot.ref.getDownloadURL()
              .then((url) => {
                d.header_image = url
                d.isHeaderLoading = false

                this.changed()
              })
          })
      },
      updateVenueImage (file) {
        let d = this
        this.isVenueImageLoading = true

        firebase.storage().ref().child(`images/venue/${file.name}`)
          .put(file)
          .then((snapshot) => {
            snapshot.ref.getDownloadURL()
              .then((url) => {
                d.venue.image_path = url
                this.isVenueImageLoading = false

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
      },
      loadCollection (collection) {
        this.currentIdUpdated = false

        if (!collection.empty) {
          let wantedSnapshot = null
          this.snapshotIsOld = false

          wantedSnapshot = collection.docs[0]
          if (this.loadedId != null) {
            collection.forEach((snap) => {
              if (snap.id === this.loadedId) {
                wantedSnapshot = snap
              }
            })
          }

          this.snapshotIsOld = wantedSnapshot.id !== collection.docs[0].id
          this.loadSnapshot(wantedSnapshot)
        }

        this.isLoading = false
      }
    },
    mounted () {
      firebase.firestore().collection("about")
        .orderBy("created", "desc")
        .limit(6)
        .onSnapshot((aboutCollection) => this.loadCollection(aboutCollection))
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

  .venue-image {
    display: flex;
  }

  .venue-image-btn {
    max-width: 40%;
  }

  .venue-image-cont {
    width: auto;
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

  .venue-text-cont {
    width: auto;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
  }

  .venue-image div:hover {
    border-color: #FFF;
  }

  .venue-image img {
    width: 100%;
    height: 100%;
  }

  @media screen and (max-width: 800px) {
    .header-image-cont {
      min-width: auto !important;
    }
  }
</style>
