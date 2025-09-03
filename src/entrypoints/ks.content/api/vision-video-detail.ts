import request from "./request";

export async function visionVideoDetail(variables: VisionVideoDetailRequest):Promise<VisionVideoDetailResponse> {
  return request({
    url: "/graphql",
    method: "POST",
    data: {
      operationName: "visionVideoDetail",
      query,
      variables,
    }
  });
}

const query =  /* GraphQL */ `
query visionVideoDetail(
  $photoId: String
  $type: String
  $page: String
  $webPageArea: String
) {
  visionVideoDetail(
    photoId: $photoId
    type: $type
    page: $page
    webPageArea: $webPageArea
  ) {
    status
    type
    author {
      id
      name
      following
      headerUrl
      livingInfo
    }
    photo {
      id
      duration
      caption
      likeCount
      realLikeCount
      coverUrl
      photoUrl
      liked
      timestamp
      expTag
      llsid
      viewCount
      videoRatio
      stereoType
      musicBlocked
      riskTagContent
      riskTagUrl
      manifest {
        mediaType
        businessType
        version
        adaptationSet {
          id
          duration
          representation {
            id
            defaultSelect
            backupUrl
            codecs
            url
            height
            width
            avgBitrate
            maxBitrate
            m3u8Slice
            qualityType
            qualityLabel
            frameRate
            featureP2sp
            hidden
            disableAdaptive
          }
        }
      }
      manifestH265
      photoH265Url
      coronaCropManifest
      coronaCropManifestH265
      croppedPhotoH265Url
      croppedPhotoUrl
      videoResource
    }
    tags {
      type
      name
    }
    commentLimit {
      canAddComment
    }
    llsid
    danmakuSwitch
  }
}
`;

export interface VisionVideoDetailRequest {
  page: string;
  photoId: string;
  webPageArea?: string | null;
  type?: string;
}

export interface VisionVideoDetailResponse {
  visionVideoDetail: VisionVideoDetail
}


export interface VisionVideoDetail {
  status: number
  type: number
  author: {
    id: string
    name: string
    following: boolean
    headerUrl: string
  }
  photo: PhotoEntity
  llsid: string
  danmakuSwitch?: boolean
  __typename: string
}

export interface PhotoEntity {
    id: string
    duration: number
    caption: string
    likeCount: string
    realLikeCount: number
    coverUrl: string
    photoUrl: string
    liked: boolean
    timestamp: number
    expTag: string
    llsid?: any
    viewCount: string
    videoRatio: number
    stereoType: number
    musicBlocked: any
    riskTagContent: any
    riskTagUrl: any
  }