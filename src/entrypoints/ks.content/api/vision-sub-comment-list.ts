import { VisionSubCommentItem } from "./comment-list-query";
import request from "./request";

export async function visionSubCommentList(photoId: string, rootCommentId: string, pcursor: string): Promise<VisionSubCommentListResponse> {
  return request({
    url: "/graphql",
    method: "POST",
    data: {
      operationName: "visionSubCommentList",
      query,
      variables: {
        photoId,
        pcursor,
        rootCommentId,
      },
    }
  });
}

const query =  /* GraphQL */ `
mutation visionSubCommentList($photoId: String, $rootCommentId: String, $pcursor: String) {
  visionSubCommentList(photoId: $photoId, rootCommentId: $rootCommentId, pcursor: $pcursor) {
    pcursor
    pcursorV2
    subCommentsV2 {
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

export interface VisionSubCommentListResponse {
  visionSubCommentList: VisionSubCommentFeed
}

export interface VisionSubCommentFeed {
  pcursor: string
  pcursorV2: string
  __typename: string
  subCommentsV2: VisionSubCommentItem[];
}