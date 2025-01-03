/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */


import handleMessage from "./message.ts";

export default defineBackground(() => {
  // @ts-ignore
  browser.runtime.onMessage.addListener(handleMessage);
});
