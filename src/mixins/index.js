import firebase from "firebase/app"

export const commonMixin = {
  props: ["loadedId"],
  data: () => ({
    timeout: 0,
    isLoading: true,
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
    loadId (collectionName) {
      firebase.firestore().collection(collectionName)
        .orderBy("created", "desc")
        .limit(6)
        .get()
        .then((collection) => this.loadCollection(collection))
    },
    changed () {
      this.modified = true
    },
    createSlug (name) {
      let slug = name.toLowerCase()
      slug = slug.replace(/\s*$/g, "")
      slug = slug.replace(/\s+/g, "-")
      return slug
    },
    createId () {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      let autoId = ""
      for (let i = 0; i < 20; i++) {
        autoId += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return autoId
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
            })
        })
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
      } else {
        this.updateState({})
      }

      this.isLoading = false
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
    resetRoute (loc) {
      this.modified = false
      this.snapshotIsOld = false
      this.$router.replace("/" + loc)
    },
    clickUpload (elId) {
      document.getElementById(elId).click()
    }
  }
}
