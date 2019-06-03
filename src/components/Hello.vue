<template>
  <v-container class="pt-5" v-if="isLoading">
    <v-layout justify-center>
      <v-progress-circular
        color="accent"
        :indeterminate="true"
      ></v-progress-circular>
    </v-layout>
  </v-container>
  <v-container v-else>
    <v-layout justify-center>Loaded!</v-layout>
  </v-container>
</template>

<script>
  export default {
    name: "Hello"
  }
</script>

<style scoped>

</style>
