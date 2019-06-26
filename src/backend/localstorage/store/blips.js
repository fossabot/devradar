import lzs from 'lz-string'

const actions = {
  getBlips ({ commit }) {
    let r = decodeURI(window.location).split('?')
    if (r.length < 2) return
    r = r[1]
      .split('&')
      .map(p => p.split('='))
      .find(([k, v]) => k === 'load')
    if (!r) return
    try {
      const string = lzs.decompressFromEncodedURIComponent(r[1])
      const obj = JSON.parse(string)
      commit('setBlips', obj.blips)
      commit('setMeta', obj.meta)
    } catch (e) {
      console.error('Error occurred trying to decompress content', e)
    }
  },
  setBlips ({ commit }, blips) {
    commit('setBlips', blips)
  },
  addBlip ({ commit, dispatch, getters }, { blip, change }) {
    // prepend https if nothing is there
    if (blip.link && !/^https?:\/\//i.test(blip.link)) blip.link = 'https://' + blip.link
    change = Object.assign(change, { index: 0 })
    blip.changes = [change]
    blip.index = getters.blipsCount
    commit('addBlip', blip)
  },
  updateBlip ({ commit }, blip) {
    commit('exchangeBlip', blip)
  },
  deleteBlip ({ commit }, blip) {
    commit('removeBlip', blip)
  },
  addChange ({ commit }, { blip, change }) {
    change = Object.assign(change, { index: blip.changes.length })
    blip.changes.push(change)
    commit('exchangeBlip', blip)
  },
  deleteChange ({ commit }, { blip, change }) {
    blip.changes = blip.changes.filter(c => c.index !== change.index)
    commit('exchangeBlip', blip)
  },
  getMeta ({ commit }) {
  },
  setMeta ({ commit }, meta) {
    const { title, categories, states } = meta
    commit('setMeta', { title, categories, states })
  }
}

export default {
  actions
}
