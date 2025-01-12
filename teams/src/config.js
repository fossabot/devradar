const { default: colors } = require('vuetify/es5/util/colors')

const config = { // needs to be ES6 module so it can be imported by webpack
  backend: {
    type: 'localstorage'
  },
  routes: [ // configure name, permissions & view ports
    // do NOT change the view property as this links to the vue component and is used for lookups across the app
    { view: 'Settings', icon: 'settings', title: 'Settings', path: '/', validator: user => true, location: ['toolbar'] },
    { view: 'Stats', icon: 'bar_chart', title: 'Stats', path: '/stats', validator: user => true, location: ['toolbar'] },
    { view: 'Spider', icon: 'pie_chart', title: 'Graph', path: '/graph', validator: user => true, location: ['toolbar'] }
  ],
  navEntries: [
    { icon: 'help', title: 'Help', url: '//devradar.io/howto', validator: user => true }
  ],
  theme: {
    primary: '#0DBD0D',
    secondary: '#ff7700',
    accent: '#0ddd0d',
    error: colors.red.base,
    warning: colors.yellow.base,
    info: colors.blue.base,
    success: colors.green.base
  },
  darkMode: false,
  blips: {
    titleCutOff: 20 // cut off title after N characters (display only)
  }
}

// precalculate some properties for later
config.routes = config.routes
  .map(i => {
    i.rootPath = i.path.split(':')[0] // path property without a potential query param
    return i
  })

export default config
