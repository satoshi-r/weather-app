/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/assets/styles/style.scss";`,
      },
    },
  },

  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'Weather App'
        return args
      })
  }
}