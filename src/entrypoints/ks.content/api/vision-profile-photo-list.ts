import request from "./request";
import { VisionVideoDetail } from "./vision-video-detail";

export async function visionProfilePhotoList(variables: VisionProfilePhotoListRequest): Promise<VisionProfilePhotoListResponse> {
  return request({
    url: "/graphql",
    method: "POST",
    data: {
      operationName: "visionProfilePhotoList",
      query,
      variables,
    }
  });
}

const query =  /* GraphQL */ `
fragment photoContent on PhotoEntity {
  __typename
  id
  duration
  caption
  originCaption
  likeCount
  viewCount
  commentCount
  realLikeCount
  coverUrl
  photoUrl
  photoH265Url
  manifest
  manifestH265
  videoResource
  coverUrls {
    url
    __typename
  }
  timestamp
  expTag
  animatedCoverUrl
  distance
  videoRatio
  liked
  stereoType
  profileUserTopPhoto
  musicBlocked
  riskTagContent
  riskTagUrl
}

fragment recoPhotoFragment on recoPhotoEntity {
  __typename
  id
  duration
  caption
  originCaption
  likeCount
  viewCount
  commentCount
  realLikeCount
  coverUrl
  photoUrl
  photoH265Url
  manifest
  manifestH265
  videoResource
  coverUrls {
    url
    __typename
  }
  timestamp
  expTag
  animatedCoverUrl
  distance
  videoRatio
  liked
  stereoType
  profileUserTopPhoto
  musicBlocked
  riskTagContent
  riskTagUrl
}

fragment feedContentWithLiveInfo on Feed {
  type
  author {
    id
    name
    headerUrl
    following
    livingInfo
    headerUrls {
      url
      __typename
    }
    __typename
  }
  photo {
    ...photoContent
    ...recoPhotoFragment
    __typename
  }
  canAddComment
  llsid
  status
  currentPcursor
  tags {
    type
    name
    __typename
  }
  __typename
}

query visionProfilePhotoList($pcursor: String, $userId: String, $page: String, $webPageArea: String) {
  visionProfilePhotoList(pcursor: $pcursor, userId: $userId, page: $page, webPageArea: $webPageArea) {
    result
    llsid
    webPageArea
    feeds {
      ...feedContentWithLiveInfo
      __typename
    }
    hostName
    pcursor
    __typename
  }
}
`;

export interface VisionProfilePhotoListRequest {
  page: string;
  pcursor: string;
  userId: string;
}

export interface VisionProfilePhotoListResponse {
  visionProfilePhotoList: VisionProfilePhotoList
}

export interface VisionProfilePhotoList {
  result: number
  llsid: string
  webPageArea: string
  feeds: VisionVideoDetail[]
  hostName: any
  pcursor: string
  __typename: string
}
