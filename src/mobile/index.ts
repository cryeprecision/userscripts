export {}

const makeImage = (imageUrl: string): JQuery<HTMLElement> => {
  const link = $('<a></a>')
    .attr('href', imageUrl)
    .attr('target', '_blank')
    .attr('rel', 'noopener noreferrer')
  link.append($('<img>').attr('src', imageUrl).addClass('customImage'))
  return link
}

const onBodyMutations: Record<string, MutationCallback> = {
  add_new_images: (mutations, observer) => {
    for (const mutation of mutations) {
      if (!($(mutation.target).attr('id')?.startsWith('gallery-img-') ?? false)) continue
      if ($(mutation.target).closest('div.overlay-image-gallery').length === 0) continue

      for (const added of mutation.addedNodes) {
        if (!$(added).is('img')) continue

        const url = $(added).attr('data-lazy')
        if (url === undefined) continue

        const imageIdx = $(added).parent().attr('id')?.substring('gallery-img-'.length)
        if (imageIdx === undefined) continue

        const imageCount = $(added).parents().eq(1).attr('data-image-count')
        if (imageCount === undefined) continue

        $('div.cBox--vehicle-details > div.cBox-body').append(makeImage(url))

        // check if this is the last image
        if (parseInt(imageIdx) == parseInt(imageCount) - 1) {
          observer.disconnect()
        }
      }
    }
  },
  empty_gallery: (mutations, observer) => {
    for (const mutation of mutations) {
      if ($(mutation.target).is('div.g-row.inline-gallery-container')) {
        $(mutation.target).remove()
        observer.disconnect()
      }
    }
  },
}

;(() => {
  // inject custom styles
  $(String.raw`
    <style type='text/css'>
      .customImage {
          width: 100%;
          margin-bottom: .5rem;
          margin-top: .5rem;
          border-radius: .5rem;
          border: 2px solid var(--color-background-primary);
      }
    </style>
  `).appendTo('head')

  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver
  const observers = Object.values(onBodyMutations).map((callback) => {
    return new MutationObserver(callback)
  })

  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
  observers.forEach((observer) =>
    observer.observe(document.querySelector('body')!, {
      childList: true,
      subtree: true,
    }),
  )
})()
