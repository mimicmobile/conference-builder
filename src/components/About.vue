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
    <v-layout wrap>
      <v-flex class="py-3" xs12>
        <div class="header-image-cont">
          <img :src="uploadedImage" alt class="header-image" v-if="uploadedImage"/>
          <div class="header-text-cont">
            <span v-if="!uploadedImage">&lt; Header Placeholder &gt;</span>
            <v-progress-circular :indeterminate="true" class="header-progress" color="accent"
                                 v-if="isHeaderLoading"></v-progress-circular>
          </div>
        </div>
        <upload-btn :noTitleUpdate="true" :round="true" @file-update="update" color="accent"
                    title="Set header image">
          <template slot="icon-left">
            <v-icon>add</v-icon>
          </template>
        </upload-btn>
      </v-flex>
      <v-flex class="py-3 px-3" xs12>
        <v-textarea :auto-grow="true" :box="true" label="Conference description"></v-textarea>
      </v-flex>
      <v-flex class="py-3 px-3" md6 xs12>
        <v-text-field :box="true" append-icon="fab fa-twitter" label="Twitter"></v-text-field>
      </v-flex>
      <v-flex class="py-3 px-3" md6 xs12>
        <v-text-field :box="true" append-icon="fas fa-code" label="Website"></v-text-field>
      </v-flex>
      <v-flex class="py-3 px-3" md6 xs12>
        <v-text-field :box="true" append-icon="email" label="Email"></v-text-field>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import firebase from "firebase/app"
  import "firebase/storage"

  import UploadButton from "vuetify-upload-button"

  export default {
    data: () => ({
      isLoading: false,
      isHeaderLoading: false,
      uploadedImage: false
    }),
    methods: {
      update (file) {
        let d = this
        this.isHeaderLoading = true

        firebase.storage().ref().child(`images/${file.name}`).put(file).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((url) => {
            d.uploadedImage = url
            d.isHeaderLoading = false
          })
        })
      }
    },
    mounted () {
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
