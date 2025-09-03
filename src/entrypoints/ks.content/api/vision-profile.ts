import request from "./request";

export async function visionProfile(variables: VisionProfileRequest): Promise<VisionProfileResponse> {
    return request({
        url: "/graphql",
        method: "POST",
        data: {
            operationName: "visionProfile",
            query,
            variables,
        }
    });
}

const query =  /* GraphQL */ `
query visionProfile($userId: String) {
  visionProfile(userId: $userId) {
    result
    hostName
    userProfile {
      ownerCount {
        fan
        photo
        follow
        photo_public
        __typename
      }
      profile {
        gender
        user_name
        user_id
        headurl
        user_text
        user_profile_bg_url
        __typename
      }
      isFollowing
      livingInfo
      __typename
    }
    __typename
  }
}
`;

export interface VisionProfileRequest {
    userId: string;
}

export interface VisionProfileResponse {
    visionProfile: VisionProfile
}

export interface VisionProfile {
    result: number
    hostName: string
    userProfile: VisionProfileResult
    __typename: string
}

export interface VisionProfileResult {
    ownerCount: VisionUserProfileOwnerCount
    profile: VisionUserProfileUser
    isFollowing: boolean
    livingInfo: {
        living: boolean
        livingId: string
        iconType: number
    }
    __typename: string
}

export interface VisionUserProfileOwnerCount {
    fan: string
    photo: any
    follow: number
    photo_public: string
    __typename: string
}

export interface VisionUserProfileUser {
    gender: string
    user_name: string
    user_id: string
    headurl: string
    user_text: string
    user_profile_bg_url: string
    __typename: string
}