# Social Media Copilot - Open Source Edition Privacy Policy

**English** | [简体中文](./PRIVACY.CN.md)

**Effective date: August 25, 2026**  
**Last updated: August 28, 2026**

Social Media Copilot - Open Source Edition (the "Extension") is an open-source Chrome extension that helps users organize social media content, creator profiles, and engagement data they are authorized to access on Xiaohongshu, Douyin, and Kuaishou. It also allows users to export this data locally as Excel files or download selected images and videos to their devices.

This Privacy Policy explains what data the Extension handles, why it is handled, where it goes, and the controls available to users. The source code of the Extension is publicly available at <https://github.com/iszhouhua/social-media-copilot>.

## 1. Data Handled by the Extension

The Extension handles data only when a user opens a supported platform page and actively uses a collection, export, copy, or download feature. It handles only the data necessary to complete the requested operation.

### 1.1 Page and Link Information

- The URL of the active tab, used to determine whether the current page belongs to a supported platform and to enable the appropriate features;
- Links to posts, creators, collections, or other pages that the user actively enters or selects, together with resource identifiers contained in those links.

The Extension does not continuously record browsing history in the background and does not read websites unrelated to its disclosed functionality.

### 1.2 Social Media Platform Content

Depending on the task initiated by the user, the Extension may handle the following content that the user is authorized to access:

- Creator or account information, such as user IDs, account names, display names, avatars, gender, biographies, profile links, and follower, following, and post counts;
- Post information, such as post IDs, titles, descriptions, publication and update times, author information, engagement counts, and image or video URLs;
- Comment information, such as comment IDs, comment text, timestamps, commenter account information, like counts, reply relationships, and comment images;
- IP-based location labels or regional information returned by the platform;
- Images, videos, and resource URLs selected by the user for download.

This data may include personally identifiable information, location or regional information, and website content. The Extension handles it only to provide the data organization, export, copy, or download operation requested by the user.

### 1.3 Authentication Information

To use the user's existing signed-in session on a supported social media platform, the Extension may temporarily access cookies, browser site-storage data, or request-signature information made available by the platform page. This information is used only to send requests actively initiated by the user to that platform.

The Extension:

- Does not ask users to provide platform passwords to the developer;
- Does not include cookies, login tokens, or request signatures in exported Excel files;
- Does not send authentication information to the Extension developer or to any server controlled by the developer;
- Does not use authentication information for purposes unrelated to the requested platform operation.

## 2. Purposes of Data Use

The Extension uses the data described above only for the following user-facing features:

- Determining whether the current page belongs to a supported platform;
- Retrieving posts, comments, or creator information specified by the user;
- Organizing data and generating Excel files on the user's device;
- Copying information selected by the user;
- Downloading images or videos selected by the user;
- Displaying task progress and necessary error messages.

The Extension does not use data for advertising, profiling, cross-site tracking, credit assessment, lending decisions, or analytics and research unrelated to the functionality described above.

## 3. Data Transmission and Sharing

To complete an operation actively requested by the user, the Extension communicates over HTTPS with the relevant social media platform and its content-delivery or media-resource domains. For example, data for a Xiaohongshu task is sent only to Xiaohongshu-related services, data for a Douyin task is sent only to Douyin-related services, and data for a Kuaishou task is sent only to Kuaishou-related services.

Other than platform communications necessary to provide the requested functionality:

- The Extension does not use a developer-operated data collection server;
- The Extension does not integrate advertising, analytics, or user-behavior tracking services;
- The developer does not receive, retain, or view data handled through the Extension;
- The Extension does not sell, rent, or otherwise provide user data to data brokers, advertising platforms, or other third parties;
- The Extension does not use user data for personalized advertising, retargeting, or interest-based advertising.

When a user actively clicks the "View Source" or "Submit Feedback" link in the Extension, GitHub opens in a new page. Activity on GitHub is governed by GitHub's own privacy policy.

## 4. Data Storage and Retention

Collection and data organization take place in the user's browser. Task data is generally held temporarily in the current page or the Extension's runtime memory and is no longer retained by the Extension after the task or relevant page is closed or refreshed.

Excel files or media files actively exported or downloaded by the user are saved to the location selected by the user or configured in the browser. The user controls and may delete those files. The Extension does not retain copies on a developer-operated server.

## 5. Permission Usage

The Extension may use the following Chrome extension permissions:

- **activeTab**: Temporarily identifies the active page and communicates with the Extension's features on that page after the user clicks the Extension icon;
- **downloads**: Saves locally generated Excel files or media selected by the user after the user initiates a download;
- **scripting**: Executes Extension functionality necessary for same-origin data requests and request signing on supported platform pages;
- **Host permissions**: Loads Extension functionality, accesses user-specified data, and sends requests to the relevant platform only on Xiaohongshu, Douyin, Kuaishou, and their necessary service domains.

These permissions are used only for the Extension's disclosed single purpose. The developer aims to limit permissions to the narrowest scope necessary to provide existing features.

## 6. Data Security

Data transmitted between the Extension and supported platforms is sent over HTTPS. Because the Extension depends on webpages and interfaces provided by third-party social media platforms, it cannot control those platforms' own data practices, security measures, or service changes. Users should also review and comply with the applicable platform privacy policies, terms of service, and laws.

## 7. User Controls and Deletion

Users may, at any time:

- Choose not to start a collection, export, copy, or download task;
- Close a task or the relevant platform page to stop current processing;
- Delete locally downloaded Excel, image, or video files;
- Disable or uninstall the Extension from Chrome's extension management page to prevent future operation;
- Sign out of the relevant social media platform or clear that website's cookies and site data.

Because the developer does not retain user data on a developer-operated server, there is no server-side user data for users to request the developer to delete.

## 8. Children's Privacy

The Extension is not directed to children and does not knowingly collect children's personal information. Users must use the Extension in accordance with applicable age requirements, local laws, and the rules of the relevant social media platforms.

## 9. Chrome Web Store Limited Use Commitment

The Extension's use of user data complies with the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data), including the Limited Use requirements.

The Extension uses only data necessary to provide or improve its disclosed single purpose. It does not transfer user data except as necessary to provide that functionality, comply with applicable law, or protect users and services from security threats. It does not use user data for personalized advertising, credit assessment, or unrelated purposes. The developer does not permit humans to read user data unless the user gives explicit consent for specific data, access is necessary for security purposes, or access is required by law.

If the Extension uses information received from Google APIs in the future, its use of that information will also comply with the Chrome Web Store User Data Policy, including the Limited Use requirements.

## 10. Changes to This Privacy Policy

If the Extension's data-handling practices change, this Privacy Policy will be updated and the "Last updated" date above will be revised. If a change materially affects the collection, use, or sharing of user data, the Extension will provide a prominent notice before the relevant feature handles data and will obtain consent where required.

## 11. Contact

For questions about this Privacy Policy or the Extension's data-handling practices, contact the developer through:

- GitHub Issues: <https://github.com/iszhouhua/social-media-copilot/issues>

