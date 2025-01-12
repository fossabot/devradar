function init (store) {
  // fetch states
  store.dispatch('getBlips')

  // set user as not logged in
  store.commit('setUser', { roles: {} })
  return Promise.resolve() // mock async interface
}

export default init
