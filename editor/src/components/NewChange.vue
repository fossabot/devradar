<template>
  <v-dialog v-model="$parent.newChangeModalVisible" max-width="80%">
    <v-card>
      <v-card-title class="title">
        Add new blip state
      </v-card-title>
      <v-card-text>
        <v-form v-model="valid" ref="form">
          <v-container grid-list-md>
            <v-layout row wrap justify-space-around>
              <v-flex sm6 xs12 d-flex>
                <v-layout row wrap>
                  <v-flex xs12>
                    <v-select :items="states" v-model="state" label="State" single-line required :rules="[v => !!v || 'State is required']"></v-select>
                  </v-flex>
                  <v-flex xs12>
                    <v-textarea v-model="changeText" label="Reason for change" rows="2"></v-textarea>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex md4 sm6 xs12>
                <v-date-picker v-model="date" type="month"></v-date-picker>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click.stop="cancel">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click.stop="submit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data () {
    return {
      valid: false,
      dialog: true,
      state: null,
      date: new Date().toISOString().slice(0, 7),
      changeText: null
    }
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        this.$emit('submit', { change: this.change, blip: this.$parent.newChangeBlip })
        this.reset()
      }
    },
    cancel () {
      this.$emit('cancel', { change: this.change, blip: this.$parent.newChangeBlip })
      this.reset()
    },
    reset () {
      this.state = null
      this.date = new Date().toISOString().slice(0, 7)
      this.changeText = null
    }
  },
  computed: {
    change () {
      return {
        date: this.date,
        newState: this.states.indexOf(this.state),
        text: this.changeText
      }
    },
    states () {
      return this.$store.getters.meta.states
    }
  }
}
</script>
