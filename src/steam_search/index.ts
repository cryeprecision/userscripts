export {}

const onBodyMutations: Record<string, MutationCallback> = {
  remove_mismatches: (mutations) => {
    // get the search input
    const input = $('input#search_text_box').val()
    if (typeof input !== 'string') return

    for (const mutation of mutations) {
      if ($(mutation.target).attr('id') !== 'search_results') continue
      for (const added of mutation.addedNodes) {
        if (!$(added).is('div.search_row')) continue

        // get the username of the result row
        const name = $(added).find('> div.searchPersonaInfo > a.searchPersonaName').text()
        if (name.length === 0) continue

        // if the name doesn't match exactly, remove it
        if (name !== input) {
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
