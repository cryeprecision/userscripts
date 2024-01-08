import { countWords } from '../lib'

export {}

const blackList = '\
aim,esp,wallhack,internal,external,triggerbot,cheat,script,macro,semirage,boost,media,pin,\
software,recoil,tool,ud,legit,rage,skin,feature,radar,marketing,spoof,hwid'.split(',')

const whiteList = '\
account,prime,smurf,rank'.split(',')

const onBodyMutations: Record<string, MutationCallback> = {
  remove_spam_threads: (mutations) => {
    for (const mutation of mutations) {
      const target = $(mutation.target)
      if (!target.is('tbody') || !target.parent().is('table#threadslist')) continue

      for (const added of mutation.addedNodes) {
        if (!$(added).is('tr')) continue

        const title = $(added).find('a[id^="thread_title_"]').text().toLowerCase()
        if (title.length === 0) continue

        if (countWords(title, blackList) !== 0 && countWords(title, whiteList) === 0) {
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
  const observers = Object.values(onBodyMutations).map((callback) => {
    return new MutationObserver(callback)
  })

  observers.forEach((observer) =>
    observer.observe(document.querySelector('body')!, {
      childList: true,
      subtree: true,
    }),
  )
})()
