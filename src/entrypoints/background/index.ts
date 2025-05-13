/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default defineBackground(() => {
  // Allows users to open the side panel by clicking on the action toolbar icon
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
});
