import request from "./request";

export async function commentListQuery(photoId: string, pcursor: string): Promise<CommentListQueryResponse> {
  return request({
    url: "/graphql",
    method: "POST",
    data: {
      operationName: "commentListQuery",
      query,
      variables: {
        photoId,
        pcursor
      },
    }
  });
}

const query =  /* GraphQL */ `
query commentListQuery($photoId: String, $pcursor: String) {
  visionCommentList(photoId: $photoId, pcursor: $pcursor) {
    commentCountV2
    pcursor
    pcursorV2
    rootCommentsV2 {
      comment_id
      author_id
      author_name
      content
      headurl
      timestamp
      likeCount
      liked
      status
      hasSubComments
      replyToUserName
      reply_to
      subCommentId
      __typename
    }
    __typename
  }
}
`

export interface CommentListQueryResponse {
  visionCommentList: VisionRootCommentFeed
}

export interface VisionRootCommentFeed {
  commentCountV2: number
  pcursor: string
  pcursorV2: string
  rootCommentsV2: VisionRootCommentItem[]
  __typename: string
}

export interface VisionRootCommentItem {
  comment_id: string
  author_id: string
  author_name: string
  content: string
  headurl: string
  timestamp: number
  likeCount: number
  liked: boolean
  status: string
  hasSubComments: boolean
  replyToUserName: string
  reply_to: string
  subCommentId: number
  __typename: string
  subComments: VisionSubCommentItem[]
  photoId?: string
}


export interface VisionSubCommentItem {
  comment_id: string
  author_id: string
  author_name: string
  content: string
  headurl: string
  timestamp: number
  likeCount: number
  liked: boolean
  status: string
  hasSubComments: boolean
  replyToUserName: string
  reply_to: string
  subCommentId: number
  __typename: string
  photoId?: string
}
