export {}

const onBodyMutations: Record<string, MutationCallback> = {
  remove_shorts: (mutations) => {
    for (const mutation of mutations) {
      for (const added of mutation.addedNodes) {
        if ($(added).find('span#title').length !== 0) {
          $(added).closest('ytd-rich-section-renderer.ytd-rich-grid-renderer').remove()
        }
      }
    }
  },
}

;(() => {
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
