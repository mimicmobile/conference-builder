<template>
  <v-container class="pt-5" v-if="isLoading">
    <v-row justify-center>
      <v-progress-circular
        color="accent"
        indeterminate
      ></v-progress-circular>
    </v-row>
  </v-container>
  <v-container grid-list-md text-xs-center v-else>
    <form v-on:change="changed">
      <v-row wrap>
        <v-col class="text-center">
          <div class="header-image-cont">
            <img :src="headerImageOrPlaceholder" alt class="header-image"/>
            <div class="header-text-cont">
              <v-progress-circular color="accent" indeterminate v-if="isHeaderLoading"></v-progress-circular>
            </div>
          </div>
          <v-btn color="accent" rounded @click="clickUpload('headerImageUpload')">
            <v-icon small>add</v-icon>
            Set header image
          </v-btn>
          <v-file-input class="hide" id="headerImageUpload" @change="updateHeaderImage"></v-file-input>
        </v-col>

        <v-col cols="12">
          <v-textarea auto-grow label="Conference description" outlined v-model="description"></v-textarea>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field append-icon="fab fa-twitter" label="Twitter" outlined v-model="twitter"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field append-icon="web" label="Website" outlined v-model="website"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field append-icon="email" label="Email" outlined v-model="contactEmail"></v-text-field>
        </v-col>

        <v-col cols="12">
          <span class="title font-weight-light">Venue</span>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field append-icon="business" label="Name" outlined v-model="venueName"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field append-icon="map" label="Address" outlined v-model="venueAddress"></v-text-field>
        </v-col>
        <v-col class="upload-image" md="8" cols="12">
          <div class="upload-image-cont">
            <img :src="venueImageOrPlaceholder" alt/>
            <div class="upload-image-text-cont">
              <v-progress-circular color="accent" indeterminate v-if="isVenueImageLoading"></v-progress-circular>
            </div>
          </div>
          <v-btn class="ml-3" color="accent" rounded @click="clickUpload('venueImageUpload')">
            <v-icon small>add</v-icon>
            Set venue image
          </v-btn>
          <v-file-input class="hide" id="venueImageUpload" @change="updateVenueImage"></v-file-input>
        </v-col>

        <v-col cols="12">
          <span class="title font-weight-light">Links</span>
        </v-col>

        <v-col cols="12">
          <v-card flat>
            <v-col class="link-group" v-if="links.length > 0" wrap cols="12">
              <v-col :key="link.name" class="link-group-item" md="6" lg="3" xs="6" v-for="(link, index) in links">
                <a :href="link.imagePath" target="_blank"><img :src="link.imagePath" alt/></a>
                <span>{{ link.name }}</span>
                <span><a :href="link.website" target="_blank">{{ link.website }}</a></span>
                <span>{{ linkTypeNameFromId(link.typeId) }}</span>
                <v-row class="link-group-button-cont mt-2" wrap>
                  <v-btn @click="editLink(index)" color="secondary" rounded small>
                    <v-icon small>edit</v-icon>
                    &nbsp;
                    Edit
                    &nbsp;
                  </v-btn>
                  <v-btn @click="deleteLink(index)" color="secondary" rounded small>
                    <v-icon small>delete</v-icon>
                    &nbsp;
                    Delete
                    &nbsp;
                  </v-btn>
                </v-row>
              </v-col>
            </v-col>
            <v-col wrap cols="12" class="text-center">
              <v-btn @click="showNewLinkDialog" color="accent" rounded>
                <v-icon small>add</v-icon>
                Add new link
              </v-btn>
            </v-col>
          </v-card>
        </v-col>

        <v-dialog max-width="600px" v-model="newLinkDialog">
          <v-card>
            <v-card-title>
              <span class="headline">Add a new link</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row wrap>
                  <v-col lg="6" xs="12">
                    <v-text-field label="Name" required v-model="newLinkName"></v-text-field>
                  </v-col>
                  <v-col lg="6" xs="12">
                    <v-text-field label="Website" required v-model="newLinkWebsite"></v-text-field>
                  </v-col>
                  <v-col lg="6" xs="12">
                    <v-combobox :items="linkTypes" item-text="name" item-value="id" label="Type" outlined small
                                v-model="newLinkTypeId"></v-combobox>
                  </v-col>
                  <v-col cols="12" class="upload-image text-center">
                    <div class="upload-image-cont">
                      <img :src="newLinkImageOrPlaceholder" alt/>
                      <div class="upload-image-text-cont">
                        <v-progress-circular color="accent" indeterminate
                                             v-if="isNewLinkImageLoading"></v-progress-circular>
                      </div>
                    </div>
                    <v-btn class="ml-2" color="accent" rounded @click="clickUpload('linkImageUpload')">
                      <v-icon small>add</v-icon>
                      Set link image
                    </v-btn>
                    <v-file-input class="hide" id="linkImageUpload" @change="updateNewLinkImage"></v-file-input>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="newLinkDialog = false" color="secondary darken-1" text>Close</v-btn>
              <v-btn :disabled="!validNewLink" @click="addNewLink" color="secondary darken-1" text>{{ addOrSaveLink }}
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
    name: "About",
    mixins: [commonMixin],
    props: ["loadedId"],
    beforeRouteUpdate (to, from, next) {
      this.loadId("about")
      next()
    },
    data: () => ({
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
      linkTypes: []
    }),
    computed: {
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

        this.resetRoute("about")

        firebase.firestore().collection("about")
          .add(update)
          .then((ref) => {
            this.currentId = ref.id
          })
      },
      updateState (d) {
        this.headerImage = d.headerImage
        this.description = d.description
        this.twitter = d.twitter
        this.website = d.website
        this.contactEmail = d.contactEmail
        this.venueName = d.venue != null ? d.venue.name : null
        this.venueAddress = d.venue != null ? d.venue.address : null
        this.venueImagePath = d.venue != null ? d.venue.imagePath : null
        this.links = d.links || []
        this.linkTypes = d.linkTypes || []
      },
      updateHeaderImage (file) {
        this.updateImage(file, "header/", "headerImage", "isHeaderLoading")
        this.changed()
      },
      updateVenueImage (file) {
        this.updateImage(file, "venue/", "venueImagePath", "isVenueImageLoading")
        this.changed()
      },
      updateNewLinkImage (file) {
        this.updateImage(file, "links/", "newLinkImagePath", "isNewLinkImageLoading")
        this.changed()
      }
    },
    mounted () {
      firebase.firestore().collection("about")
        .orderBy("created", "desc")
        .limit(6)
        .onSnapshot((aboutCollection) => this.loadCollection(aboutCollection))
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
    grid-template-columns: repeat(auto-fill, 260px);
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
    justify-content: space-evenly;
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
