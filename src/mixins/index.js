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
      }

      this.isLoading = false
    },
    resetRoute (loc) {
      this.modified = false
      this.snapshotIsOld = false
      this.$router.replace("/" + loc)
    }
  }
}
