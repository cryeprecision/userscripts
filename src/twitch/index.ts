export {}

const onBodyMutations: Record<string, MutationCallback> = {
  remove_cookie_banner: (mutations) => {
    for (const mutation of mutations) {
      for (const added of mutation.addedNodes) {
        const consent_banner = $(added).find('div.consent-banner')
        if (consent_banner.length !== 0) {
          consent_banner.remove()
          return
        }
      }
    }
  },
  remove_front_page_carousel: (mutations) => {
    for (const mutation of mutations) {
      for (const added of mutation.addedNodes) {
        const carousel = $(added).find('div.front-page-carousel')
        if (carousel.length !== 0) {
          carousel.remove()
          return
        }
      }
    }
  },
  remove_non_game_prime: (mutations) => {
    for (const mutation of mutations) {
      for (const added of mutation.addedNodes) {
        const header = $(added).find('div.prime-offer-header-card')
        if (header.length === 0) continue

        const offers = header.siblings('div')
        for (const offer of offers) {
          if ($(offer).find('a').text() !== 'Spiel abholen') {
            $(offer).remove()
          }
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
