export {}

import { ExtractPosts, ExtractThreads, Extractor } from './extract'
import { Filter, Filterable } from './filter'

const gFilter: Filter = {
  forbiddenTags: ['Configs', 'Official Reselling', 'Русский'],
  forbiddenTitleWords: ['hwid', 'crash', 'aa', 'cfg', 'config'],
  forbiddenUsers: ['bingaan'],
  forbiddenCategories: ['cs2-configs-cs2', 'offtop-17-category', 'reselling'],
  maxAgeSinceCreationSeconds: 60 * 60 * 24 * 7,
}

const gExtractors: Extractor[] = [new ExtractPosts(), new ExtractThreads()]

const onBodyMutation: MutationCallback = (mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        // extract all filterables
        const filterables = gExtractors.reduce<Filterable[]>((acc, next) => {
          const filterables = next.tryExtract(node)
          if (filterables !== null) acc.push(...filterables)
          return acc
        }, [])
        // filter them out
        filterables.forEach((filterable) => {
          if (!filterable.passesFilter(gFilter)) {
            filterable.filterOut()
          }
        })
      }
    } else if (mutation.type === 'attributes') {
      // extract all filterables
      const filterables = gExtractors.reduce<Filterable[]>((acc, next) => {
        const filterables = next.tryExtract(mutation.target)
        if (filterables !== null) acc.push(...filterables)
        return acc
      }, [])
      // filter them out
      filterables.forEach((filterable) => {
        if (!filterable.passesFilter(gFilter)) {
          filterable.filterOut()
        }
      })
    }
  }
}

;(() => {
  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver
  const observer = new MutationObserver(onBodyMutation)

  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
  observer.observe(document.querySelector('body')!, {
    childList: true,
    subtree: true,
    attributeFilter: ['class'],
  })

  // css class for hidden elements
  $(String.raw`
    <style type='text/css'>
        .shitter-hidden {
            filter: blur(10px) grayscale(1);
            opacity: 0.2;
            transition: filter 300ms cubic-bezier(.22,.61,.36,1),
                        opacity 300ms cubic-bezier(.22,.61,.36,1);
        }
        .shitter-hidden:hover {
            filter: none;
            opacity: 1;
        }
    </style>
  `).appendTo('head')
})()
