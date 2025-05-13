/**
 * Copyright (c) Andy Zhou. (https://github.com/iszhouhua)
 *
 * This source code is licensed under the GPL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from "axios";

const request = axios.create({
    baseURL: "https://www.kuaishou.com",
    timeout: 10000,
    withCredentials: true,
});

export default request;