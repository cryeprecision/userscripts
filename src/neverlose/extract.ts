import dayjs from 'dayjs'
import { Filterable, Post, Thread } from './filter'

export abstract class Extractor<T extends Filterable = Filterable> {
  public abstract tryExtract(addedNode: Node): T[] | null
}

export type Age = {
  created: number
  latest?: number
}

/**
 * Parse datetime strings like
 * - `Jan 4, 2024 4:37 pm`
 */
const parseDate = (str: string): number | null => {
  const parsed = dayjs(str, 'MMM D, YYYY h:mm a')
  return parsed.isValid() ? parsed.unix() : null
}

/**
 * Parse datetime strings like
 * - `Created: Dec 8, 2023 8:35 pm\nLatest: Jan 4, 2024 7:16 pm`
 * - `Created: Jan 4, 2024 4:37 pm`
 */
const parseThreadAge = (str: string): Age | null => {
  // remove the `Created: ` and `Latest: ` prefixes
  const parts = str.split('\n').map((part) => {
    return parseDate(part.substring(part.indexOf(':') + 2))
  })
  if (parts.length === 0 || parts[0] === null) {
    return null
  }
  return {
    created: parts[0],
    latest: parts[1] ?? undefined,
  }
}

export class ExtractPosts extends Extractor<Post> {
  public override tryExtract(addedNode: Node): Post[] | null {
    if (!window.location.href.startsWith('https://forum.neverlose.cc/t/')) {
      return null
    }

    const postDivs = (() => {
      if ($(addedNode).is('div.topic-post')) {
        return [addedNode]
      }
      if ($(addedNode).is('div.post-stream')) {
        return $(addedNode).find('> div.topic-post').toArray()
      }
      return null
    })()
    if (postDivs === null || postDivs.length === 0) {
      return null
    }

    const posts: Post[] = []
    for (const postDiv of postDivs) {
      const usernameLink = $(postDiv)
        .find<HTMLAnchorElement>('div.topic-meta-data > div.names > span.username > a')
        .attr('href')
      if (usernameLink === undefined) continue

      const username = usernameLink
        .replace('https://forum.neverlose.cc/u/', '')
        .replace('/u/', '')
        .toLowerCase()

      const postedTime = $(postDiv)
        .find<HTMLSpanElement>('div.post-date > a.post-date > span.relative-date')
        .attr('title')
      if (postedTime === undefined) continue

      const posted = parseDate(postedTime)
      if (posted === null) continue

      posts.push(new Post({ node: postDiv, user: username, posted }))
    }

    if (posts.length !== 0) {
      return posts
    }

    return null
  }
}

export class ExtractThreads extends Extractor<Thread> {
  public override tryExtract(addedNode: Node): Thread[] | null {
    const threads: Thread[] = []

    if ($(addedNode).is('tr.topic-list-item'))
      (() => {
        const tag = $(addedNode).find('span.badge-category__name').text()
        const title = $(addedNode).find('a.title').text().toLowerCase()

        const ageText = $(addedNode).find('td.age.activity').attr('title')
        if (ageText === undefined) return

        const age = parseThreadAge(ageText)
        if (!age) return

        const classes = $(addedNode).attr('class')?.split(/\s+/)
        if (!classes) return

        const category = classes
          .find((class_) => class_.startsWith('category-'))
          ?.substring('category-'.length)
        if (category === undefined) return

        const creator = $(addedNode)
          .find<HTMLAnchorElement>('> td.posters > a:nth-child(1)')
          .attr('href')
          ?.replace('https://forum.neverlose.cc/u/', '')
          .replace('/u/', '')
          .toLowerCase()

        threads.push(
          new Thread({
            node: addedNode,
            title,
            created: age.created,
            lastPost: age.latest,
            tag,
            category,
            creator,
          }),
        )
      })()
    else if ($(addedNode).is('div.latest-topic-list-item'))
      (() => {
        const tag = $(addedNode).find('span.badge-category__name').text()
        const title = $(addedNode).find('a.title').text().toLowerCase()

        const ageText = $(addedNode).find('div.topic-last-activity > a').attr('title')
        if (ageText === undefined) return

        const age = parseThreadAge(ageText)
        if (!age) return

        const classes = $(addedNode).attr('class')?.split(/\s+/)
        if (!classes) return

        const category = classes
          .find((class_) => class_.startsWith('category-'))
          ?.substring('category-'.length)
        if (category === undefined) return

        threads.push(
          new Thread({
            node: addedNode,
            title,
            created: age.created,
            lastPost: age.latest,
            tag,
            category,
          }),
        )
      })()

    if (threads.length !== 0) {
      return threads
    }

    return null
  }
}
