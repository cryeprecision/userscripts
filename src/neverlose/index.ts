import dayjs from 'dayjs'
import _ from 'lodash'
import { countInstances } from '../lib'

type Age = {
  secondsSinceCreation: number
  secondsSinceLastActivity?: number
}

// Parse datetime strings like
// - Created: Dec 8, 2023 8:35 pm\nLatest: Jan 4, 2024 7:16 pm
// - Created: Jan 4, 2024 4:37 pm
const parseDate = (str: string): number | undefined => {
  const parsed = dayjs(str, 'MMM D, YYYY h:mm a')
  return parsed.isValid() ? parsed.unix() : undefined
}

const parseAge = (str: string): Age | undefined => {
  const parts = str.split('\n').map((part) => {
    return parseDate(part.substring(part.indexOf(':') + 2))
  })
  if (parts.length === 0 || !parts[0]) return

  const now = new Date().getTime() / 1_000
  return {
    secondsSinceCreation: now - parts[0],
    secondsSinceLastActivity: parts.length > 1 && parts[1] ? now - parts[1] : undefined,
  }
}

type Post = {
  title: string
  tag: string
  age: Age
}

type Filter = {
  forbiddenTags: string[]
  forbiddenTitleWords: string[]
  maxAgeSinceCreationSeconds?: number
  postsRemoved: number

  shouldRemove: (self: Filter, post: Post) => boolean
}

let filter: Filter = {
  forbiddenTags: ['Configs', 'Official Reselling', 'Русский'],
  forbiddenTitleWords: ['hwid'],
  maxAgeSinceCreationSeconds: 60 * 60 * 24 * 7,
  postsRemoved: 0,

  shouldRemove: (self: Filter, { title, tag, age }: Post): boolean => {
    return (
      // contains a forbidden tag
      self.forbiddenTags.indexOf(tag) !== -1 ||
      // contains a forbidden title word
      self.forbiddenTitleWords.findIndex((word) => title.indexOf(word) !== -1) !== -1 ||
      // is too old
      (self.maxAgeSinceCreationSeconds &&
        age.secondsSinceCreation > self.maxAgeSinceCreationSeconds) ||
      // cast to bool
      false
    )
  },
}

const extractPost = (rawNode: Node): Post | undefined => {
  // make sure we're viewing the forum
  if (!window.location.href.startsWith('https://forum.neverlose.cc/')) return
  const relativePath = window.location.href.substring('https://forum.neverlose.cc/'.length)

  const node = $(rawNode)

  // we're viewing a category where threads are tagged
  // e.g. `https://forum.neverlose.cc/c/cs2/39`
  // or we're viewing the list of latest posts
  // e.g. `https://forum.neverlose.cc/latest`
  if (
    countInstances(relativePath, '/') === 2 ||
    relativePath === 'latest/' ||
    relativePath === 'latest'
  ) {
    if (!node.is('tr') || !node.hasClass('topic-list-item')) return

    const addedNodeTag = node.find(
      'td.main-link > div.link-bottom-line > a > span.badge-category > span.category-name',
    )
    if (addedNodeTag.length === 0) return

    const addedNodeTitle = node.find('td.main-link > span.link-top-line > a.title')
    if (addedNodeTitle.length === 0) return

    const addedNodeCreated = node.find('td.age').attr('title')
    if (!addedNodeCreated || addedNodeCreated.length === 0) return

    const age = parseAge(addedNodeCreated)
    if (!age) return

    return {
      title: addedNodeTitle.text().toLowerCase().trim(),
      tag: addedNodeTag.text().trim(),
      age,
    }
  }

  // we're viewing a sub-category, thread aren't tagged here
  // e.g. `https://forum.neverlose.cc/c/cs2/problems-cs2/40`
  if (countInstances(relativePath, '/') === 3) {
    return
  }

  // we're viewing the homepage of the forum
  // e.g. `https://forum.neverlose.cc/`
  if (relativePath.length === 0) {
    if (!node.is('div') || !node.hasClass('latest-topic-list-item')) return

    const addedNodeTag = node.find(
      'div.main-link > div.bottom-row > a.badge-wrapper > span.badge-category > span.category-name',
    )
    if (addedNodeTag.length === 0) return

    const addedNodeTitle = node.find('div.main-link > div.top-row > a.title')
    if (addedNodeTitle.length === 0) return

    const addedNodeCreated = node
      .find('div.topic-stats > div.topic-last-activity > a')
      .attr('title')
    if (!addedNodeCreated || addedNodeCreated.length === 0) return

    const age = parseAge(addedNodeCreated)
    if (!age) return

    return {
      title: addedNodeTitle.text().toLowerCase().trim(),
      tag: addedNodeTag.text().trim(),
      age,
    }
  }
}

const onBodyMutation: MutationCallback = (mutations, observer) => {
  const oldPostsRemoved = filter.postsRemoved

  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      const post = extractPost(node)
      if (post && filter.shouldRemove(filter, post)) {
        $(mutation.addedNodes).remove()
        filter.postsRemoved += mutation.addedNodes.length
      }
    }
  }

  if (filter.postsRemoved !== oldPostsRemoved) {
    console.log(`removed ${filter.postsRemoved} posts`)
  }
}

;(() => {
  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/MutationObserver
  const observer = new MutationObserver(onBodyMutation)

  // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
  observer.observe(document.querySelector('body')!, {
    childList: true,
    subtree: true,
  })
})()
