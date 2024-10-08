// aweme/v1/web/user/profile/other
export interface UserProfileOther {
  status_code: number
  status_msg: string
  user: UserInfo
}

export interface UserInfo {
  account_cert_info: string
  apple_account: number
  aweme_count: number
  aweme_count_correction_threshold: number
  birthday_hide_level: number
  can_set_item_cover: boolean
  can_show_group_card: number
  city: string
  close_friend_type: number
  commerce_user_level: number
  country: string
  cover_colour: string
  custom_verify: string
  dongtai_count: number
  enable_ai_double: number
  enable_wish: boolean
  enterprise_user_info: string
  enterprise_verify_reason: string
  familiar_confidence: number
  favorite_permission: number
  favoriting_count: number
  follow_guide: boolean
  follow_status: number
  follower_count: number
  follower_request_status: number
  follower_status: number
  following_count: number
  forward_count: number
  gender: number
  has_e_account_role: boolean
  has_subscription: boolean
  im_primary_role_id: number
  im_role_ids: number[]
  image_send_exempt: boolean
  ins_id: string
  ip_location: string
  is_activity_user: boolean
  is_ban: boolean
  is_block: boolean
  is_blocked: boolean
  is_effect_artist: boolean
  is_gov_media_vip: boolean
  is_mix_user: boolean
  is_not_show: boolean
  is_series_user: boolean
  is_sharing_profile_user: number
  is_star: boolean
  iso_country_code: string
  live_commerce: boolean
  live_status: number
  mate_add_permission: number
  max_follower_count: number
  message_chat_entry: boolean
  mix_count: number
  mplatform_followers_count: number
  new_friend_type: number
  nickname: string
  pigeon_daren_status: string
  pigeon_daren_warn_tag: string
  profile_tab_type: number
  province: string
  public_collects_count: number
  publish_landing_tab: number
  recommend_reason_relation: string
  recommend_user_reason_source: number
  risk_notice_text: string
  role_id: string
  room_id: number
  room_id_str: string
  school_name: string
  sec_uid: string
  secret: number
  series_count: number
  share_info: {
    bool_persist: number
    life_share_ext: string
    share_desc: string
    share_title: string
    share_url: string
    share_weibo_desc: string
  }
  short_id: string
  show_favorite_list: boolean
  show_subscription: boolean
  signature: string
  signature_display_lines: number
  signature_language: string
  special_follow_status: number
  story_tab_empty: boolean
  sync_to_toutiao: number
  total_favorited: number
  total_favorited_correction_threshold: number
  twitter_id: string
  twitter_name: string
  uid: string
  unique_id: string
  user_age: number
  user_not_see: number
  user_not_show: number
  verification_type: number
  watch_status: boolean
  with_commerce_enterprise_tab_entry: boolean
  with_commerce_entry: boolean
  with_fusion_shop_entry: boolean
  with_new_goods: boolean
  youtube_channel_id: string
  youtube_channel_title: string
  official_cooperation: {
    schema: string
    text: string
    track_type: string
  }
}