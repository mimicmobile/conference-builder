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
            <img :src="headerImageOrPlaceholder" alt class="header-image"/>
            <div class="header-text-cont">
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
          <v-text-field append-icon="email" label="Email" outline v-model="contactEmail"></v-text-field>
        </v-flex>

        <v-flex class="py-3" text-xs-left xs12>
          <span class="title font-weight-light">Venue</span>
        </v-flex>

        <v-flex class="pb-3" md6 xs12>
          <v-text-field append-icon="fas fa-marker" label="Name" outline v-model="venueName"></v-text-field>
        </v-flex>
        <v-flex class="pb-3" md6 xs12>
          <v-text-field append-icon="fas fa-building" label="Address" outline v-model="venueAddress"></v-text-field>
        </v-flex>
        <v-flex class="pb-3 upload-image" md8 xs12>
          <div class="upload-image-cont">
            <img :src="venueImageOrPlaceholder" alt/>
            <div class="upload-image-text-cont">
              <v-progress-circular color="accent" indeterminate v-if="isVenueImageLoading"></v-progress-circular>
            </div>
          </div>
          <upload-btn @file-update="updateVenueImage" class="upload-image-btn" color="accent" noTitleUpdate
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
            <v-flex class="link-group" v-if="links.length > 0" wrap xs12>
              <v-flex :key="link.name" class="link-group-item" lg3 md6 v-for="(link, index) in links" xs6>
                <a :href="link.imagePath" target="_blank"><img :src="link.imagePath" alt/></a>
                <span>{{ link.name }}</span>
                <span><a :href="link.website" target="_blank">{{ link.website }}</a></span>
                <span>{{ linkTypeNameFromId(link.typeId) }}</span>
                <div class="link-group-button-cont">
                  <v-btn @click="editLink(index)" color="secondary" round>Edit link
                  </v-btn>
                  <v-btn @click="deleteLink(index)" color="secondary" round>Delete link
                  </v-btn>
                </div>
              </v-flex>
            </v-flex>
            <v-flex wrap xs12>
              <v-btn @click="showNewLinkDialog" color="accent" round>Add new link</v-btn>
            </v-flex>
          </v-card>
        </v-flex>

        <v-dialog max-width="600px" v-model="newLinkDialog">
          <v-card>
            <v-card-title>
              <span class="headline">Add a new link</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex lg6 xs12>
                    <v-text-field label="Name" required v-model="newLinkName"></v-text-field>
                  </v-flex>
                  <v-flex lg6 xs12>
                    <v-text-field label="Website" required v-model="newLinkWebsite"></v-text-field>
                  </v-flex>
                  <v-flex lg6 xs12>
                    <v-combobox :items="linkTypes" item-text="name" item-value="id" label="Type" outline small
                                v-model="newLinkTypeId"></v-combobox>
                  </v-flex>
                  <v-flex class="pb-3 upload-image" lg12 xs12>
                    <div class="upload-image-cont">
                      <img :src="newLinkImageOrPlaceholder" alt/>
                      <div class="upload-image-text-cont">
                        <v-progress-circular color="accent" indeterminate
                                             v-if="isNewLinkImageLoading"></v-progress-circular>
                      </div>
                    </div>
                    <upload-btn @file-update="updateNewLinkImage" class="upload-image-btn" color="accent" noTitleUpdate
                                round title="Set image">
                      <template slot="icon-left">
                        <v-icon>add</v-icon>
                      </template>
                    </upload-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="newLinkDialog = false" color="secondary darken-1" flat>Close</v-btn>
              <v-btn :disabled="!validNewLink" @click="addNewLink" color="secondary darken-1" flat>{{ addOrSaveLink }}
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

  function getPlaceholderImage (dimension) {
    return `https://via.placeholder.com/${dimension}/454545/454545`
  }

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
      isNewLinkImageLoading: false,
      headerImage: false,
      description: null,
      twitter: null,
      website: null,
      contactEmail: null,
      venueName: null,
      venueAddress: null,
      venueImagePath: null,
      newLinkIndex: null,
      newLinkName: null,
      newLinkWebsite: null,
      newLinkImagePath: null,
      newLinkTypeId: null,
      newLinkDialog: false,
      links: [],
      linkTypes: [],
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
      },
      headerImageOrPlaceholder () {
        return this.headerImage || getPlaceholderImage("800x260")
      },
      venueImageOrPlaceholder () {
        return this.venueImagePath || getPlaceholderImage("200x200")
      },
      newLinkImageOrPlaceholder () {
        return this.newLinkImagePath || getPlaceholderImage("200x200")
      },
      validNewLink () {
        return this.newLinkName != null && this.newLinkWebsite != null && this.newLinkImagePath != null && this.newLinkTypeId != null
      },
      addOrSaveLink () {
        return this.newLinkIndex != null ? "Save" : "Add"
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
      showNewLinkDialog () {
        this.newLinkName = null
        this.newLinkWebsite = null
        this.newLinkImagePath = null
        this.newLinkTypeId = null
        this.newLinkIndex = null
        this.newLinkDialog = true
      },
      addNewLink () {
        let fixedTypeId
        if (typeof this.newLinkTypeId === "string" || this.newLinkTypeId instanceof String) {
          fixedTypeId = this.newLinkTypeId.replace(" ", "_").toLowerCase()
          this.linkTypes.push({
            name: this.newLinkTypeId,
            id: fixedTypeId
          })
        } else {
          fixedTypeId = this.newLinkTypeId["id"]
        }

        const update = {
          name: this.newLinkName,
          website: this.newLinkWebsite,
          imagePath: this.newLinkImagePath,
          typeId: fixedTypeId
        }

        if (this.newLinkIndex != null) {
          this.links[this.newLinkIndex] = update
        } else {
          this.links.push(update)
        }
        this.cleanUpLinkTypes()

        this.newLinkDialog = false
        this.changed()
      },
      editLink (index) {
        const link = this.links[index]

        this.newLinkIndex = index
        this.newLinkName = link.name
        this.newLinkWebsite = link.website
        this.newLinkTypeId = this.linkTypeFromId(link.typeId)
        this.newLinkImagePath = link.imagePath
        this.newLinkDialog = true
      },
      deleteLink (index) {
        this.links.splice(index, 1)
        this.cleanUpLinkTypes()
        this.changed()
      },
      cleanUpLinkTypes () {
        const newLinkTypes = new Set([])
        this.links.forEach((link) => this.linkTypes.forEach((linkType) => {
          if (link.typeId === linkType.id) newLinkTypes.add(linkType)
        }))
        this.linkTypes = Array.from(newLinkTypes)
        this.sortLinkTypes()
      },
      sortLinkTypes () {
        this.linkTypes.sort((a, b) => a.name - b.name)
      },
      linkTypeFromId (linkId) {
        return this.linkTypes.filter((linkType) => linkType.id === linkId)[0]
      },
      linkTypeNameFromId (linkId) {
        return this.linkTypeFromId(linkId).name
      },
      save () {
        let update = {
          headerImage: this.headerImage,
          description: this.description,
          twitter: this.twitter,
          website: this.website,
          contactEmail: this.contactEmail,
          venue: {
            name: this.venueName,
            address: this.venueAddress,
            imagePath: this.venueImagePath
          },
          links: this.links,
          linkTypes: this.linkTypes,
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
        this.headerImage = d.headerImage
        this.description = d.description
        this.twitter = d.twitter
        this.website = d.website
        this.contactEmail = d.contactEmail
        this.venueName = d.venue.name
        this.venueAddress = d.venue.address
        this.venueImagePath = d.venue.imagePath
        this.links = d.links || []
        this.linkTypes = d.linkTypes || []
      },
      updateImage (file, path, urlVar, loadingVar) {
        this[loadingVar] = true

        firebase.storage().ref().child(`images/${path}${file.name}`)
          .put(file)
          .then((snapshot) => {
            snapshot.ref.getDownloadURL()
              .then((url) => {
                this[urlVar] = url
                this[loadingVar] = false

                this.changed()
              })
          })
      },
      updateHeaderImage (file) {
        this.updateImage(file, "header/", "headerImage", "isHeaderLoading")
      },
      updateVenueImage (file) {
        this.updateImage(file, "venue/", "venueImagePath", "isVenueImageLoading")
      },
      updateNewLinkImage (file) {
        this.updateImage(file, "links/", "newLinkImagePath", "isNewLinkImageLoading")
      },
      loadSnapshot (snap) {
        if (this.currentId !== null && this.currentId !== snap.id && this.modified) {
          this.currentIdUpdated = true
          this.modified = false
          // TODO: If modified, alert user, offer to switch them
        }
        this.currentId = snap.id
        this.updateState(snap.data())
        this.sortLinkTypes()
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

  .upload-image {
    display: flex;
    flex-flow: row;
    align-items: center;
  }

  .upload-image-cont {
    width: 320px;
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

  .link-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    grid-row-gap: 20px;
    justify-content: space-around;
  }

  .link-group-item {
    max-width: 320px;
    display: flex;
    flex-flow: column;
    flex-basis: available;
    text-align: start;
    margin: 10px;
  }

  .link-group-item img {
    width: 100%;
    height: auto;
  }

  .link-group-item span {
    font-size: 14pt;
    padding: 4px;
  }

  .link-group-button-cont {
    align-self: center
  }

  @media screen and (max-width: 800px) {
    .header-image-cont {
      min-width: auto !important;
    }

    .upload-image {
      flex-flow: column;
    }
  }
</style>
