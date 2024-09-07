// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vesp/nuxt-fontawesome", "@pinia/nuxt"],
  fontawesome: {
    icons: {
      solid: ["people-arrows"],
    },
  },
});