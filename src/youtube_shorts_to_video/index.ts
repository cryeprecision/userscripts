// credits: https://github.com/makise-homura/watch-youtube-shorts-as-normal-videos

const replaceLocation = () => {
  if (window.location.toString().includes('/shorts/')) {
    window.location.replace(window.location.toString().replace('/shorts/', '/watch?v='))
  }
}

// in case we opened a new page
replaceLocation()

// see https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
let oldHref = document.location.href

$(() => {
  const observer = new MutationObserver(() => {
    if (oldHref != window.location.toString()) {
      oldHref = window.location.toString()
      replaceLocation()
    }
  })

  observer.observe(document.querySelector('body')!, {
    childList: true,
    subtree: true,
  })
})
