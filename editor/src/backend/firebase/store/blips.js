import firebase from 'firebase/app'
import 'firebase/firestore'
import appConfig from '../../../config'

function migrateToEnum (blip) {
  const b = JSON.parse(JSON.stringify(blip)) // create hard copy
  let updateRequired = false
  if (typeof b.category === 'string') {
    b.category = appConfig.backend.categories.indexOf(b.category)
    updateRequired = true
  }
  if (typeof b.state === 'string') {
    b.state = appConfig.backend.states.indexOf(b.state)
    updateRequired = true
  }
  b.changes = b.changes
    .map(change => {
      if (typeof change.newState === 'string') {
        change.newState = appConfig.backend.states.indexOf(change.newState)
        //
        const document = change.id
        delete change.id
        console.log('updating change', change)
        firebase.firestore().collection(`blips/${b.id}/changes`).doc(document).update(change)
      }
      return change
    })
  if (updateRequired) {
    const document = b.id
    delete b.id
    delete b.changes
    console.log('updating blip', blip)
    firebase.firestore().collection('blips').doc(document).update(blip)
  }
}

const actions = {
  getBlips ({ commit, getters, state }) {
    commit('setLoading', true)
    let blipsArray
    firebase.firestore().collection('blips').get()
      .then(snapshot => {
        blipsArray = snapshot.docs
          .map(d => Object.assign(d.data(), { id: d.id }))
        return Promise.all(blipsArray.map(b => firebase.firestore().collection(`blips/${b.id}/changes`).get()))
      })
      .then(snapshotArray => {
        for (const [index, snapshot] of snapshotArray.entries()) {
          const changes = snapshot.docs.map(d => Object.assign(d.data(), { id: d.id }))
          blipsArray[index].changes = changes
        }
        blipsArray = blipsArray
          .filter(b => b.title && b.id)
          .filter(b => b.changes && b.changes.length > 0)

        // migrate from string category/state to enums
        if (getters.userCanEdit) {
          blipsArray.forEach(migrateToEnum)
        }

        blipsArray.forEach(blip => commit('addBlip', blip))
        commit('setLoading', false)
      })
  },
  addBlip ({ commit, dispatch }, blip) {
    commit('setLoading', true)
    // prepend https if nothing is there
    const { category, description, title } = blip
    let link = blip.link
    if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link
    // handle each change separately to create valid documents
    const changes = blip.changes
    delete blip.changes
    firebase.firestore().collection('blips').add({ category, description, title, link })
      .then(docRef => {
        blip.id = docRef.id
        blip.changes = []
        changes.forEach(change => dispatch('addChange', { blip, change }))
        commit('setLoading', false)
      })
  },
  updateBlip ({ commit }, blip) {
    commit('setLoading', true)
    // create copy of the store object to remove changes array/index for firebase entry
    const { category, description, title } = blip
    let link = blip.link
    // prepend https if nothing is there
    if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link
    firebase.firestore().collection('blips').doc(blip.id).update({ category, description, title, link })
      .then(() => {
        commit('exchangeBlip', blip)
        commit('setLoading', false)
      })
  },
  deleteBlip ({ commit }, blip) {
    commit('setLoading', true)
    firebase.firestore().collection('blips').doc(blip.id).delete()
      .then(() => {
        commit('removeBlip', blip)
        commit('setLoading', false)
      })
  },
  addChange ({ commit }, { blip, change }) {
    commit('setLoading', true)
    const { date, newState, text } = change
    firebase.firestore().collection(`blips/${blip.id}/changes`).add({ date, newState, text })
      .then(docRef => {
        change.id = docRef.id
        blip.changes.push(change)
        commit('exchangeBlip', blip)
        commit('setLoading', false)
      })
  },
  deleteChange ({ commit }, { blip, change }) {
    commit('setLoading', true)
    firebase.firestore().collection(`blips/${blip.id}/changes`).doc(change.id).delete()
      .then(() => {
        blip.changes = blip.changes.filter(c => c.id !== change.id)
        commit('exchangeBlip', blip)
        commit('setLoading', false)
      })
  },
  getMeta ({ commit }) {
    const { title, states, categories } = appConfig.backend
    const meta = { title, states, categories }
    commit('setMeta', meta)
  }
}

export default {
  actions
}
