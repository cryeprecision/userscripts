import { z } from 'zod'

export const FilterSchema = z.object({
  forbiddenTags: z.array(z.string()),
  forbiddenTitleWords: z.array(z.string()),
  forbiddenUsers: z.array(z.string()),
  forbiddenCategories: z.array(z.string()),
})
export type Filter = z.infer<typeof FilterSchema>

const any = <T>(shits: T[], shitFn: (shit: T) => boolean): boolean => {
  for (const shit of shits) {
    if (shitFn(shit)) {
      return true
    }
  }
  return false
}

export class Filterable {
  /**
   * The node that should be mutated if this doesn't pass the filter
   */
  public node: Node

  /**
   * `¯\_(ツ)_/¯`
   */
  protected constructor(node: Node) {
    this.node = node
  }

  /**
   * Check if this thingy passes the filter or not
   */
  public passesFilter(_filter: Filter): boolean {
    return false
  }

  /**
   * What to do if this thingy doesn't pass the filter
   */
  public filterOut(): void {
    if (!$(this.node).hasClass('shitter-hidden')) {
      $(this.node).addClass('shitter-hidden')
    }
  }
}

export class Thread extends Filterable {
  private title: string
  private crated: number
  private lastPost?: number
  private tag?: string
  private category: string
  private creator?: string

  public constructor(args: {
    node: Node
    /**
     * Title of the thread
     */
    title: string
    /**
     * When the thread was created
     */
    created: number
    /**
     * When the last post was made to the thread
     */
    lastPost?: number
    /**
     * Category tag name, if there is any
     */
    tag?: string
    /**
     * Category embedded in the css class
     */
    category: string
    /**
     * User that created the thread
     */
    creator?: string
  }) {
    super(args.node)
    this.title = args.title
    this.crated = args.created
    this.lastPost = args.lastPost
    this.tag = args.tag
    this.category = args.category
    this.creator = args.creator
  }

  public override passesFilter(filter: Filter): boolean {
    if (this.tag !== undefined && filter.forbiddenTags.indexOf(this.tag) !== -1) {
      return false
    }

    if (this.creator !== undefined && filter.forbiddenUsers.indexOf(this.creator) !== -1) {
      return false
    }

    if (any(filter.forbiddenCategories, (cat) => this.category === cat)) {
      return false
    }

    if (any(filter.forbiddenTitleWords, (word) => this.title.includes(word))) {
      return false
    }

    return true
  }
}

export class Post extends Filterable {
  private user: string
  private posted: number

  public constructor(args: {
    node: Node
    /**
     * User that created this post
     */
    user: string
    /**
     * When this post was posted
     */
    posted: number
  }) {
    super(args.node)
    this.user = args.user
    this.posted = args.posted
  }

  public override passesFilter(filter: Filter): boolean {
    if (filter.forbiddenUsers.indexOf(this.user) !== -1) {
      return false
    }
    return true
  }
}
