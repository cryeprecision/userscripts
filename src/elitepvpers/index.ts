export {}

import { z } from 'zod'
import { countWords, loadOrStoreDefault } from '../lib'

const FilterSchema = z.object({
  /**
   * If a title contains words on the whitelist, it is not filtered
   */
  titleWhitelist: z.array(z.string()),
  /**
   * If a title contains only words on the blacklist, it is filtered
   */
  titleBlacklist: z.array(z.string()),
})
type Filter = z.infer<typeof FilterSchema>

let gFilter: Filter = {
  titleBlacklist: [],
  titleWhitelist: [],
}

const onBodyMutations: Record<string, MutationCallback> = {
  remove_spam_threads: (mutations) => {
    for (const mutation of mutations) {
      const target = $(mutation.target)
      if (!target.is('tbody') || !target.parent().is('table#threadslist')) continue

      for (const added of mutation.addedNodes) {
        if (!$(added).is('tr')) continue

        const title = $(added).find('a[id^="thread_title_"]').text().toLowerCase()
        if (title.length === 0) continue

        const onBlackList = countWords(title, gFilter.titleBlacklist)
        const onWhiteList = countWords(title, gFilter.titleWhitelist)

        if (onBlackList && !onWhiteList) {
          $(added).remove()
        }
      }
    }
  },
  remove_adblock_banner: (mutations) => {
    for (const mutation of mutations) {
      for (const added of mutation.addedNodes) {
        if ($(added).is('img[src^="/images/ublock-censor-"]')) {
          $(added).remove()
        }
      }
    }
  },
}

;(() => {
  gFilter = loadOrStoreDefault(FilterSchema, 'elitepvpers-filter', gFilter)
  if (gFilter.titleBlacklist.length === 0 && gFilter.titleWhitelist.length === 0) {
    console.error('elitepvpers filter config is empty, set values in the browser local storage')
    return
  }

  const observer = new MutationObserver((mutations, observer) => {
    Object.values(onBodyMutations).forEach((callback) => {
      callback(mutations, observer)
    })
  })
  observer.observe(document.querySelector('body')!, {
    childList: true,
    subtree: true,
  })
})()
